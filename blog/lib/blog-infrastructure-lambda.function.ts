import 'source-map-support/register'

import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { MikroORM, SqlEntityManager } from '@mikro-orm/postgresql'
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Book } from './entities/Book'
import { getOrmConfig } from './orm-config'
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import opentelemetry from '@opentelemetry/api'
import { APIGatewayEvent, Context } from 'aws-lambda'
import _ from 'lodash'

import { getEnvironment } from './utils/get-environment'

const tracer = opentelemetry.trace.getTracer('my-service-tracer')

const getOrm = _.memoize(async () => {
  const secret = await tracer.startActiveSpan('get-secret', async (span) => {
    const secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' })

    const { DATABASE_SECRET_ARN } = getEnvironment(['DATABASE_SECRET_ARN'])

    const command = new GetSecretValueCommand({
      SecretId: DATABASE_SECRET_ARN,
    })

    const secret = await secretsManagerClient.send(command)

    span.end()

    return secret
  })

  const secretValues = JSON.parse(secret.SecretString ?? '{}')

  const host = process.env.LOCAL_INVOKE ? 'localhost' : secretValues.host

  const ormConfig = getOrmConfig({
    user: secretValues.username,
    host: host,
    password: secretValues.password,
    port: parseInt(secretValues.port, 10),
  })

  const orm = await tracer.startActiveSpan('orm-init', async (span) => {
    const orm = await MikroORM.init<PostgreSqlDriver>(ormConfig)
    span.end()
    return orm
  })

  return orm
})

const otelPromise = () => {
  const traceExporter = new OTLPTraceExporter()

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  })

  return sdk.start()
}

const typeDefs = `#graphql
  type Book {
    uuid: String
    createdAt: String
    updatedAt: String
    title: String
  }

  type Query {
    hello: String
    books: [Book]
  }

  type Mutation {
    createBook: Book
  }
`

type LambdaContext = {
  em: SqlEntityManager<PostgreSqlDriver>
}

const resolvers = {
  Query: {
    hello: (root: any, args: any, context: LambdaContext) => {
      return 'world'
    },
    books: async (root: any, args: any, context: LambdaContext) => {
      const bookRepository = context.em.getRepository(Book)

      const books = await tracer.startActiveSpan('find-books', async (span) => {
        const books = await bookRepository.findAll()
        span.end()
        return books
      })

      return books
    },
  },
  Mutation: {
    createBook: async (root: any, args: any, context: LambdaContext) => {
      const bookRepository = context.em.getRepository(Book)

      const book = new Book()

      bookRepository.create(book)

      book.title = 'Custom title from API'

      await bookRepository.persistAndFlush(book)

      return book
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

export const handler = async (event: APIGatewayEvent, context: Context, cb: any): Promise<any> => {
  await otelPromise()

  return tracer.startActiveSpan('handler', async (span) => {
    const response = await startServerAndCreateLambdaHandler(server, {
      context: async ({ event, context }) => {
        const orm = await tracer.startActiveSpan('orm-setup', async (span) => {
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
    })(event, context, cb)

    span.end()

    return response
  })
}
