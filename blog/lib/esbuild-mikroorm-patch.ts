import { PostgreSqlConnection } from '@mikro-orm/postgresql'
import KnexPostgres from 'knex/lib/dialects/postgres'

PostgreSqlConnection.prototype.connect = async function (this: PostgreSqlConnection) {
  this['patchKnex']()
  this.client = this.createKnexClient(KnexPostgres)
}
