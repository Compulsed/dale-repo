import { GraphQLError } from 'graphql'

export const notFoundError = (entity: string) => {
  return new GraphQLError(`${entity} Not Found`, {
    extensions: { code: 'NOT_FOUND' },
  })
}

export const invalidSecretError = () => {
  throw new GraphQLError('Invalid Secret', {
    extensions: {
      code: 'INVALID_SECRET_ERROR',
    },
  })
}
