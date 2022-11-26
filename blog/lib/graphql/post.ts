import _ from 'lodash'
import { v4 } from 'uuid'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

// Custom imports
import { SpanStatusCode, trace } from '../otel'
import { Post } from '../entities/Post'
import { getEnvironment } from '../utils/get-environment'
import { QueryOrder } from '@mikro-orm/core'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GraphQLError } from 'graphql'
import { LambdaContext } from '../graphql-types'

type CreatePostArgs = {
  id?: string
  postInput: PostInput
  secret: string
}

type UpdatePostArgs = {
  id: string
  postInput: PostInput
  secret: string
}

type PostArgs = {
  id: string
  secret: string
}

type PostInput = Partial<{
  title: string
  body: string
  shortDescription: string
  longDescription: string
  imageUrl: string
}>

type UpdatePostResponse = {
  status: boolean
  errorMessage: string | null
  post: Post | null
}

enum PublishStatus {
  Published = 'PUBLISHED',
  Hidden = 'HIDDEN',
  Draft = 'DRAFT',
}

const isSecret = (secret: string): boolean => {
  return secret === 'daleisadmin'
}

// TODO: Consider changing the way errors are handled, errors array, errors body, or errors enums
const invalidSecretResponse = (): UpdatePostResponse => {
  return {
    status: false,
    errorMessage: 'Invalid Secret',
    post: null,
  }
}

const raiseInvalidSecretError = () => {
  throw new GraphQLError('Invalid Secret', {
    extensions: {
      code: 'INVALID_SECRET_ERROR',
    },
  })
}

export const postTypeDefs = `#graphql
  enum PublishStatus {
    PUBLISHED
    HIDDEN
    DRAFT
  }

  type Post {
    id: ID!
    title: String
    body: String
    shortDescription: String
    longDescription: String
    imageUrl: String
    createdAt: String
    updatedAt: String
    publishStatus: PublishStatus
    availableWithLink: Boolean
  }

  input PostInput {
    title: String
    body: String
    shortDescription: String
    longDescription: String
    imageUrl: String
  }
  
  type UpdatePostResponse {
    status: Boolean!
    errorMessage: String
    post: Post
  }

  type Query {
    post(id: ID!): Post
    posts: [Post]
    editorPost(id: ID!, secret: String!): Post
    editorPosts(secret: String!): [Post]
    editorSignedUrl(fileName: String!, secret: String!, contentType: String!): String
  }

  type Mutation {
    createPost (id: ID, postInput: PostInput!, secret: String!): UpdatePostResponse!
    updatePost (id: ID!, postInput: PostInput!, secret: String!): UpdatePostResponse!
    publishPost (id: ID!, secret: String!): UpdatePostResponse!
    hidePost (id: ID!, secret: String!): UpdatePostResponse!
    unhidePost (id: ID!, secret: String!): UpdatePostResponse!
    setAvailableWithLink (id: ID!, secret: String!): UpdatePostResponse!
    removeAvailableWithLink (id: ID!, secret: String!): UpdatePostResponse!
  }
`

export const postResolvers = {
  Post: {
    createdAt: ({ createdAt }: Post) => createdAt && new Date(createdAt).toISOString(),
    updatedAt: ({ updatedAt }: Post) => updatedAt && new Date(updatedAt).toISOString(),
  },

  Query: {
    rawError: async () => {
      throw new Error('Raw error')
    },

    graphQLError: async () => {
      const activeSpan = trace.getActiveSpan()

      activeSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Error',
      })

      throw new GraphQLError('Custom GraphQLError', {
        extensions: {
          code: 'YOUR_ERROR_CODE',
          myCustomExtensions: {
            message: 'data',
          },
        },
      })
    },

    hello: async (_: any, __: any, ___: LambdaContext) => {
      return 'world!!'
    },

    post: (_: any, { id }: { id: string }, context: LambdaContext): Promise<Post> => {
      const postRepository = context.em.getRepository(Post)

      // TODO: Consider 404 handling
      return postRepository.findOneOrFail({
        id: id,
        $or: [{ publishStatus: PublishStatus.Published }, { availableWithLink: true }],
      })
    },

    posts: (_: any, __: any, context: LambdaContext): Promise<Post[]> => {
      const postRepository = context.em.getRepository(Post)

      return postRepository.find(
        {
          publishStatus: PublishStatus.Published,
        },
        { orderBy: { createdAt: QueryOrder.DESC } }
      )
    },

    editorPost: (_: any, { id, secret }: any, context: LambdaContext): Promise<Post> => {
      if (!isSecret(secret)) {
        raiseInvalidSecretError()
      }

      const postRepository = context.em.getRepository(Post)

      // TODO: Consider 404 handling
      return postRepository.findOneOrFail({
        id: id,
      })
    },

    editorPosts: (_: any, { secret }: any, context: LambdaContext): Promise<Post[]> => {
      if (!isSecret(secret)) {
        raiseInvalidSecretError()
      }

      if (!isSecret(secret)) {
        raiseInvalidSecretError()
      }

      const postRepository = context.em.getRepository(Post)

      return postRepository.find({}, { orderBy: { createdAt: QueryOrder.DESC } })
    },

    editorSignedUrl: async (_: any, { fileName, contentType, secret }: any) => {
      if (!isSecret(secret)) {
        raiseInvalidSecretError()
      }

      const { IMAGE_BUCKET_NAME } = getEnvironment(['IMAGE_BUCKET_NAME'])

      const client = new S3Client({})

      const command = new PutObjectCommand({
        Bucket: IMAGE_BUCKET_NAME,
        Key: `${v4()}-${fileName}`,
        ContentType: contentType,
      })

      const url = await getSignedUrl(client, command, { expiresIn: 3600 })

      return url
    },
  },

  Mutation: {
    createPost: async (_: any, args: CreatePostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      if (!isSecret(args.secret)) {
        return invalidSecretResponse()
      }

      const postRepository = context.em.getRepository(Post)

      const postInput = {
        ...args.postInput,
        publishStatus: PublishStatus.Draft,
      }

      const post = postRepository.create(new Post(args.id ?? null, postInput))

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },

    updatePost: async (_: any, args: UpdatePostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      if (!isSecret(args.secret)) {
        return invalidSecretResponse()
      }

      const postRepository = context.em.getRepository(Post)

      const post = await postRepository.upsert(new Post(args.id, args.postInput))

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },

    publishPost: async (_: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      if (!isSecret(args.secret)) {
        return invalidSecretResponse()
      }

      const postRepository = context.em.getRepository(Post)

      const post = await postRepository.findOneOrFail({
        id: args.id,
        publishStatus: PublishStatus.Draft,
      })

      post.publishStatus = PublishStatus.Published

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },

    hidePost: async (_: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      if (!isSecret(args.secret)) {
        return invalidSecretResponse()
      }

      const postRepository = context.em.getRepository(Post)

      const post = await postRepository.findOneOrFail({
        id: args.id,
        publishStatus: PublishStatus.Published,
      })

      post.publishStatus = PublishStatus.Hidden

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },

    unhidePost: async (_: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      if (!isSecret(args.secret)) {
        return invalidSecretResponse()
      }

      const postRepository = context.em.getRepository(Post)

      const post = await postRepository.findOneOrFail({
        id: args.id,
        publishStatus: PublishStatus.Hidden,
      })

      post.publishStatus = PublishStatus.Published

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },

    setAvailableWithLink: async (_: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      if (!isSecret(args.secret)) {
        return invalidSecretResponse()
      }

      const postRepository = context.em.getRepository(Post)

      const post = await postRepository.findOneOrFail({
        id: args.id,
      })

      post.availableWithLink = true

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },

    removeAvailableWithLink: async (_: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      if (!isSecret(args.secret)) {
        return invalidSecretResponse()
      }

      const postRepository = context.em.getRepository(Post)

      const post = await postRepository.findOneOrFail({
        id: args.id,
      })

      post.availableWithLink = false

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },
  },
}
