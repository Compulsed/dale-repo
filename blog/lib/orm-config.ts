import _ from 'lodash'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { getEnvironment } from './utils/get-environment'
import { MikroORM, PostgreSqlDriver } from '@mikro-orm/postgresql'

import { tracer } from './otel'
import { Post } from './entities/Post'

export const getOrmConfig = (config: any) => {
  const { STAGE } = getEnvironment(['STAGE'])

  const sharedConfig = {
    type: 'postgresql',

    dbName: `blog-${STAGE}`,

    debug: true,

    migrations: {
      path: './lib/migrations',
      tableName: 'migrations',
      transactional: true,
    },

    entities: [Post],
  }

  return { ...config, ...sharedConfig }
}

export const getOrm = _.memoize(async () => {
  const secret = await tracer.startActiveSpan('get-secret', async (span: any) => {
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

  // 600ms - 2s to initialize on cold-start due to pg-connect
  const orm = await tracer.startActiveSpan('orm-init', async (span: any) => {
    const orm = await MikroORM.init<PostgreSqlDriver>(ormConfig)
    span.end()
    return orm
  })

  return orm
})
