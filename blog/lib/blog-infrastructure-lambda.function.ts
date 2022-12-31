import 'source-map-support/register'

import _ from 'lodash'
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'
import { unwrapResolverError } from '@apollo/server/errors'

// Custom imports
import { sdkInit, SpanStatusCode, trace, tracer } from './otel'
import { getEnvironment, getEnvironmentUnsafe } from './utils/get-environment'

import * as Sentry from '@sentry/serverless'

// Resolvers
import { postResolvers, postTypeDefs } from './graphql/post'
import { commonResolvers, commonTypeDefs } from './graphql/common'
import { getOrm } from './orm-config'
import { GraphQLError } from 'graphql'

const isGraphQLError = (error: unknown) => {
  return unwrapResolverError(error) instanceof GraphQLError
}

// ApolloServer generates `graphql.parseSchema` spans. To ensure they're captured
//  in Hny, initialize in the lambda handler, & cache for subsequent requests
const serverHandler = _.memoize(() => {
  const { STAGE } = getEnvironment(['STAGE'])

  const server = new ApolloServer({
    typeDefs: mergeTypeDefs([commonTypeDefs, postTypeDefs]),
    resolvers: mergeResolvers([commonResolvers, postResolvers]),
    includeStacktraceInErrorResponses: STAGE !== 'prod',
    formatError: (formattedError, error) => {
      // Treat GraphQL Errors as 'validation' or 'handled' errors, unless they're marked as Internal errors
      if (!isGraphQLError(error) || formattedError?.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        const activeSpan = trace.getActiveSpan()

        activeSpan.setStatus({
          code: SpanStatusCode.ERROR,
        })

        const resolverError = unwrapResolverError(error)

        activeSpan.recordException(resolverError)

        Sentry.captureException(resolverError)

        // Return unhandled / unexpected errors as internal
        return new GraphQLError('Internal server error 🔥', {
          path: formattedError.path,
          extensions: formattedError.extensions,
        })
      }

      return formattedError
    },
  })

  return startServerAndCreateLambdaHandler(server, {
    context: async ({ event, context }) => {
      const orm = await tracer.startActiveSpan('orm-setup', async (span: any) => {
        const orm = await getOrm()
        span.end()
        return orm
      })

      const em = orm.em.fork()

      return {
        lambdaEvent: event,
        lambdaContext: context,
        em,
      }
    },
  })
})

Sentry.AWSLambda.init({
  dsn: 'https://7d92c390ee8c4497bb0a14e8b9ad97a1@o4504419291234304.ingest.sentry.io/4504419295559680',
  tracesSampleRate: 1.0,
  environment: getEnvironment(['STAGE']).STAGE,
  release: getEnvironmentUnsafe(['RELEASE']).RELEASE,
})

const handler = Sentry.AWSLambda.wrapHandler(
  async (event: APIGatewayEvent, context: Context, cb: any): Promise<any> => {
    // eslint-disable-next-line no-console
    console.log('event', JSON.stringify(event, null, 2))

    await sdkInit // To run locally, you need to await for SDK start

    const response = await tracer.startActiveSpan('handler', { root: true }, async (span: any) => {
      const response = (await serverHandler()(event, context, cb)) as APIGatewayProxyResult

      // TODO: Looks like CORS is meant to be provided by serverless express
      //    https://www.apollographql.com/docs/apollo-server/deployment/lambda/
      //  Likely do not need CORS, so we are defining our own headers
      response['headers'] = Object.assign({}, response['headers'], {
        'access-control-allow-methods': 'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD',
        'access-control-allow-origin': '*',
        'access-control-allow-headers':
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'access-control-allow-credentials': 'true',
      })

      span.end()

      return response
    })

    return response
  },
  { captureTimeoutWarning: true }
)

module.exports = { handler }
