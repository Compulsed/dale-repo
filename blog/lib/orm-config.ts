import _ from 'lodash'
import { getEnvironment } from './utils/get-environment'
import { MikroORM, Options, PostgreSqlDriver } from '@mikro-orm/postgresql'

import { tracer } from './otel'
import { Post } from './entities/Post'
import { Tag } from './entities/Tag'
import { notFoundError } from './errors'

export const getOrmConfig = (config: Options) => {
  const { STAGE, PGHOST, PGUSER, PGPASSWORD } = getEnvironment(['STAGE', 'PGHOST', 'PGUSER', 'PGPASSWORD'])

  const sharedConfig: Options = {
    type: 'postgresql',
    host: PGHOST,
    dbName: `blog-${STAGE}`, // TODO: Use a DB helper
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
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
  // TODO: Can we just use the same config?
  const ormConfig = getOrmConfig({
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
