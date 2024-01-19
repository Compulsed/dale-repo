import _ from 'lodash'
import { getEnvironment } from './utils/get-environment'
import { MikroORM, Options, PostgreSqlDriver } from '@mikro-orm/postgresql'

import { tracer } from './otel'
import { Post } from './entities/Post'
import { Tag } from './entities/Tag'
import { notFoundError } from './errors'
import { PoolConfig } from '@mikro-orm/core'

export const getOrmConfig = (config: Options) => {
  const { STAGE, PGHOST, PGUSER, PGPASSWORD } = getEnvironment(['STAGE', 'PGHOST', 'PGUSER', 'PGPASSWORD'])

  // Observed behaviour: The pool limits the amount of concurrent connections to be opened / used.
  //  If the pool is full, the connection is queued until a connection becomes available. If the pool is empty, a new connection is opened.
  //
  // Note: There is no batching at the resolver level, this means that resolvers can run into a huge N+1 problem. Least by using this pool
  //  it limits the possibility of PG running out of connections.
  //
  // Error:   remaining connection slots are reserved for roles with the SUPERUSER attribute
  const poolConfig: PoolConfig = { min: 0, max: 4 }

  const sharedConfig: Options = {
    type: 'postgresql',
    host: PGHOST,
    dbName: `blog-${STAGE}`,
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    debug: true,
    pool: poolConfig,
    driverOptions: {
      connection: { ssl: true },
    },
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
  const orm: MikroORM = await tracer.startActiveSpan('orm-init', async (span: any) => {
    const orm = await MikroORM.init<PostgreSqlDriver>(ormConfig)
    span.end()
    return orm
  })

  return orm
})
