import { getEnvironment } from './utils/get-environment'

import { Book } from './entities/Book'
import { Pages } from './entities/Pages'

const { STAGE } = getEnvironment(['STAGE'])

export const getOrmConfig = (config: any) => {
  const sharedConfig = {
    type: 'postgresql',

    dbName: `blog-${STAGE}`,

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
