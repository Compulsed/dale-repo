import _ from 'lodash'
import { Post } from '../entities/Post'

// Custom imports
import { Tag } from '../entities/Tag'
import { invalidSecretError } from '../errors'
import { LambdaContext } from '../graphql-types'
import { isSecret } from '../utils/secret'
import { PublishStatus } from './post'

export const tagTypeDefs = `#graphql
  type Tag {
    id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
    posts: [Post!]!
    editorPosts(secret: String!): [Post!]!
  }

  type Query {
    tags: [Tag]
  }

  type Mutation {
    createTag(name: String!): Tag
  }
`

export const tagResolvers = {
  Tag: {
    createdAt: ({ createdAt }: Tag) => createdAt && new Date(createdAt).toISOString(),
    updatedAt: ({ updatedAt }: Tag) => updatedAt && new Date(updatedAt).toISOString(),
    posts: async ({ name }: Tag, _args: any, context: LambdaContext): Promise<Post[]> => {
      const postRepository = context.em.getRepository(Post)

      const posts = await postRepository.find({
        publishStatus: PublishStatus.Published,
        tags: {
          name: {
            $in: [name],
          },
        },
      })

      return posts
    },

    editorPosts: async ({ name }: Tag, { secret }: any, context: LambdaContext): Promise<Post[]> => {
      if (!isSecret(secret)) {
        throw invalidSecretError()
      }

      const postRepository = context.em.getRepository(Post)

      const posts = await postRepository.find({
        tags: {
          name: {
            $in: [name],
          },
        },
      })

      return posts
    },
  },

  Query: {
    tags: (_: any, __: any, context: LambdaContext): Promise<Tag[]> => {
      const tagRepository = context.em.getRepository(Tag)

      return tagRepository.findAll()
    },
  },

  Mutation: {
    createTag: async (_: any, { name }: { name: string }, context: LambdaContext): Promise<Tag> => {
      const tagRepository = context.em.getRepository(Tag)

      const tag = new Tag()

      tag.name = name

      tagRepository.create(tag)

      await tagRepository.persistAndFlush(tag)

      return tag
    },
  },
}
