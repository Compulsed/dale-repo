import { getOrmConfig } from './lib/orm-config'

export default new Promise((resolve) => {
  const ormConfig = getOrmConfig({
    dbName: 'postgres',
    user: 'postgres',
    host: 'localhost',
    password: '1qY^I8YJT92o8aGaaa6Rl4.yLilJw7',
    port: 5432,
  })

  resolve(ormConfig)
})
