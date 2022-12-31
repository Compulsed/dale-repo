import { GraphQLError } from 'graphql'
import * as Sentry from '@sentry/serverless'

import { SpanStatusCode, trace } from '../otel'
import { LambdaContext } from '../graphql-types'

export const commonTypeDefs = `#graphql
  type Query {
    hello: String!
    rawError: String
    clientError: String
    graphQLError: String
    sentryError: String
  }
`

export const commonResolvers = {
  Query: {
    rawError: () => {
      throw new Error('Raw error')
    },

    clientError: () => {
      throw new GraphQLError('Client Error', {
        extensions: {
          code: 'CLIENT_ERROR',
        },
      })
    },

    sentryError: () => {
      Sentry.captureException(new Error('Custom Sentry Error'))

      return 'Error sent'
    },

    graphQLError: () => {
      const activeSpan = trace.getActiveSpan()

      activeSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Error',
      })

      throw new GraphQLError('Custom GraphQLError', {
        extensions: {
          code: 'YOUR_ERROR_CODE',
          myCustomExtensions: {
            message: 'data',
          },
        },
      })
    },

    hello: async (_: any, __: any, ___: LambdaContext) => {
      return 'world!!'
    },
  },
}
