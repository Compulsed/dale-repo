import { getOrmConfig } from './lib/orm-config'

export default Promise.resolve().then(async () => {
  return getOrmConfig({})
})
