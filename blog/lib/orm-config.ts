import _ from 'lodash'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { getEnvironment } from './utils/get-environment'
import { MikroORM, Options, PostgreSqlDriver } from '@mikro-orm/postgresql'

import { tracer } from './otel'
import { Post } from './entities/Post'
import { Tag } from './entities/Tag'
import { notFoundError } from './errors'

export const getOrmConfig = (config: Options) => {
  const sharedConfig: Options = {
    type: 'postgresql',

    debug: true,

    migrations: {
      path: './lib/migrations',
      tableName: 'migrations',
      transactional: true,
      // Fixes https://github.com/mikro-orm/mikro-orm/issues/190
      //  - Original error: set session_replication_role = 'replica'; - permission denied to set parameter "session_replication_role"
      disableForeignKeys: false,
    },

    entities: [Post, Tag],
  }

  return { ...config, ...sharedConfig }
}

export const getOrm = _.memoize(async () => {
  const secret = await tracer.startActiveSpan('get-secret', async (span: any) => {
    const secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' })

    const { APP_DATABASE_SECRET_ARN } = getEnvironment(['APP_DATABASE_SECRET_ARN'])

    const command = new GetSecretValueCommand({
      SecretId: APP_DATABASE_SECRET_ARN,
    })

    const secret = await secretsManagerClient.send(command)

    span.end()

    return secret
  })

  const secretValues = JSON.parse(secret.SecretString ?? '{}')

  const host = process.env.LOCAL_INVOKE ? 'localhost' : secretValues.host

  const ormConfig = getOrmConfig({
    user: secretValues.username,
    dbName: secretValues.dbname,
    host: host,
    password: secretValues.password,
    port: parseInt(secretValues.port, 10),
    findOneOrFailHandler: (entityName: string) => {
      throw notFoundError(entityName)
    },
  })

  // 600ms - 2s to initialize on cold-start due to pg-connect
  const orm = await tracer.startActiveSpan('orm-init', async (span: any) => {
    const orm = await MikroORM.init<PostgreSqlDriver>(ormConfig)
    span.end()
    return orm
  })

  return orm
})
