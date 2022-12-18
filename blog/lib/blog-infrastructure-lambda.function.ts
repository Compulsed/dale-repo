import 'source-map-support/register'

import _ from 'lodash'
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'
import { unwrapResolverError } from '@apollo/server/errors'

// Custom imports
import { sdkInit, SpanStatusCode, trace, tracer } from './otel'
import { getEnvironment } from './utils/get-environment'

// Resolvers
import { postResolvers, postTypeDefs } from './graphql/post'
import { commonResolvers, commonTypeDefs } from './graphql/common'
import { getOrm } from './orm-config'
import { GraphQLError } from 'graphql'

// ApolloServer generates `graphql.parseSchema` spans. To ensure they're captured
//  in Hny, initialize in the lambda handler, & cache for subsequent requests
const serverHandler = _.memoize(() => {
  const { STAGE } = getEnvironment(['STAGE'])

  const server = new ApolloServer({
    typeDefs: mergeTypeDefs([commonTypeDefs, postTypeDefs]),
    resolvers: mergeResolvers([commonResolvers, postResolvers]),
    includeStacktraceInErrorResponses: STAGE !== 'prod',
    formatError: (formattedError, error) => {
      // Capture uncaught exceptions / INTERNAL_SERVER_ERROR as errors in HNY for alerting
      if (
        !(unwrapResolverError(error) instanceof GraphQLError) ||
        formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR'
      ) {
        const activeSpan = trace.getActiveSpan()

        activeSpan.setStatus({
          code: SpanStatusCode.ERROR,
        })

        activeSpan.recordException(unwrapResolverError(error))

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

const handler = async (event: APIGatewayEvent, context: Context, cb: any): Promise<any> => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(event, null, 2))

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
}

module.exports = { handler }
