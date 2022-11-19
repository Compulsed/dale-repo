import { PostgreSqlConnection } from '@mikro-orm/postgresql'

const KnexPostgres = require('knex/lib/dialects/postgres')

PostgreSqlConnection.prototype.connect = async function (this: PostgreSqlConnection) {
  this['patchKnex']()
  this.client = this.createKnexClient(KnexPostgres)
}
