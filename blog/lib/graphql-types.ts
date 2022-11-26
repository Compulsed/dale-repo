import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { SqlEntityManager } from '@mikro-orm/postgresql'

export type LambdaContext = {
  em: SqlEntityManager<PostgreSqlDriver>
}
