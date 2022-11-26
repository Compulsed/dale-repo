import { gql } from '@apollo/client'

export const POST_FRAGMENT = gql`
  fragment PostParts on Post {
    id
    title
    shortDescription
    longDescription
    imageUrl
    body
    createdAt
    updatedAt
    publishStatus
    availableWithLink
  }
`
