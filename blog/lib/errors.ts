import { GraphQLError } from 'graphql'

export const notFoundError = (entity: string) => {
  return new GraphQLError(`${entity} Not Found`, {
    extensions: { code: 'NOT_FOUND' },
  })
}

export const validationError = (errorMessage: string) => {
  return new GraphQLError(errorMessage, {
    extensions: {
      code: 'VALIDATION_ERROR',
    },
  })
}

export const invalidSecretError = () => {
  return new GraphQLError('Invalid Secret', {
    extensions: {
      code: 'INVALID_SECRET_ERROR',
    },
  })
}
