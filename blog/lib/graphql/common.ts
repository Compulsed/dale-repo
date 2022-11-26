import { GraphQLError } from 'graphql'
import { SpanStatusCode, trace } from '../otel'
import { LambdaContext } from '../graphql-types'

export const commonTypeDefs = `#graphql
  type Query {
    hello: String!
    rawError: String
    graphQLError: String
  }
`

export const commonResolvers = {
  Query: {
    rawError: async () => {
      throw new Error('Raw error')
    },

    graphQLError: async () => {
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
