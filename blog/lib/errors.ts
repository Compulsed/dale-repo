import { GraphQLError } from 'graphql'

export const notFoundError = (entity: string) => {
  return new GraphQLError(`${entity} Not Found`, {
    extensions: { code: 'NOT_FOUND' },
  })
}
