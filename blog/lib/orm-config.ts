import { Book } from './entities/Book'
import { Pages } from './entities/Pages'

export const getOrmConfig = (config: any) => {
  const sharedConfig = {
    type: 'postgresql',

    debug: true,

    migrations: {
      path: './lib/migrations',
      tableName: 'migrations',
      transactional: true,
    },

    entities: [Book, Pages],
  }

  return { ...config, ...sharedConfig }
}
