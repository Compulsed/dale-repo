import 'source-map-support/register'

import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { Client } from 'pg'
import { MikroORM } from '@mikro-orm/postgresql'
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Book } from './entities/Book'

const secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' })

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const secretArn = process.env.databaseSecretArn

  const command = new GetSecretValueCommand({
    SecretId: secretArn,
  })

  const secret = await secretsManagerClient.send(command)

  const secretValues = JSON.parse(secret.SecretString ?? '{}')

  // Raw PG
  const client = new Client({
    user: secretValues.username,
    host: secretValues.host,
    database: 'postgres',
    password: secretValues.password,
    port: secretValues.port,
  })

  await client.connect()

  const res = await client.query('SELECT $1::text as message', ['Hello from PG!'])

  const dbResponse = res.rows[0].message // Hello world!

  await client.end()

  // Mikro
  const orm = await MikroORM.init<PostgreSqlDriver>({
    type: 'postgresql',

    // TODO: Change this to a custom database per app
    dbName: 'postgres',
    user: secretValues.username,
    host: secretValues.host,
    password: secretValues.password,
    port: parseInt(secretValues.port, 10),

    debug: true,

    migrations: {
      path: './lib/migrations',
      tableName: 'migrations',
      transactional: true,
    },

    entities: [Book],
  })

  console.log(orm.em)

  const bookRepository = orm.em.getRepository(Book)

  const totalBooks = await bookRepository.count()

  console.log('Total books', totalBooks)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `DB Response: ${dbResponse}`,
      totalBooks,
      secretArn,
    }),
  }
}
