import 'source-map-support/register'

import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { MikroORM } from '@mikro-orm/postgresql'
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Book } from './entities/Book'
import { getOrmConfig } from './orm-config'
import { Pages } from './entities/Pages'

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' })

  const secretArn = process.env.DATABASE_SECRET_ARN

  const command = new GetSecretValueCommand({
    SecretId: secretArn,
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

  // Mikro
  const orm = await MikroORM.init<PostgreSqlDriver>(ormConfig)

  const em = orm.em.fork()

  const bookRepository = em.getRepository(Book)

  const newBook = new Book()

  newBook.title = 'New book title'

  bookRepository.create(newBook)

  await em.persistAndFlush(newBook)

  const totalBooks = await bookRepository.count()

  console.log('Total books', totalBooks)

  const pagesRepository = em.getRepository(Pages)

  const totalPages = await pagesRepository.count()

  console.log('Total pages', totalBooks)

  return {
    statusCode: 200,
    body: JSON.stringify({
      totalBooks,
      totalPages,
      secretArn,
    }),
  }
}
