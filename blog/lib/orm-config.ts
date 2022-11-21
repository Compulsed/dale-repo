import { getEnvironment } from './utils/get-environment'
import { Post } from './entities/Post'

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

    entities: [Post],
  }

  return { ...config, ...sharedConfig }
}
