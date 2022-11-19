import 'source-map-support/register'

import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { MikroORM, SqlEntityManager } from '@mikro-orm/postgresql'
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Book } from './entities/Book'
import { getOrmConfig } from './orm-config'
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda'
import { getEnvironment } from './utils/get-environment'

const ormPromise = Promise.resolve().then(async () => {
  const secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' })

  const { DATABASE_SECRET_ARN } = getEnvironment(['DATABASE_SECRET_ARN'])

  const command = new GetSecretValueCommand({
    SecretId: DATABASE_SECRET_ARN,
  })

  const secret = await secretsManagerClient.send(command)

  const secretValues = JSON.parse(secret.SecretString ?? '{}')

  const host = process.env.LOCAL_INVOKE ? 'localhost' : secretValues.host

  const ormConfig = getOrmConfig({
    user: secretValues.username,
    host: host,
    password: secretValues.password,
    port: parseInt(secretValues.port, 10),
  })

  return MikroORM.init<PostgreSqlDriver>(ormConfig)
})

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
    books: (root: any, args: any, context: LambdaContext) => {
      const bookRepository = context.em.getRepository(Book)

      return bookRepository.findAll()
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

export const handler = startServerAndCreateLambdaHandler(server, {
  context: async ({ event, context }) => {
    const orm = await ormPromise

    const em = orm.em.fork()

    return {
      lambdaEvent: event,
      lambdaContext: context,
      em,
    }
  },
})
