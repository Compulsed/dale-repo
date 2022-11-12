import { Options } from '@mikro-orm/core'

export default new Promise((resolve) => {
  const config: Options = {
    type: 'postgresql',

    // TODO: Change this to a custom database per app
    dbName: 'postgres',
    user: 'postgres',
    host: 'localhost',
    password: '1qY^I8YJT92o8aGaaa6Rl4.yLilJw7',
    port: 5432,

    debug: true,

    migrations: {
      path: './lib/migrations',
      tableName: 'migrations',
      transactional: true,
    },

    // TODO: These values might be incorrect
    entities: ['./lib/entities'], // path to our JS entities (dist), relative to `baseDir` // TODO: Was dist/entities
    entitiesTs: ['./lib/entities'], // path to our TS entities (src), relative to `baseDir`
  }

  resolve(config)
})
