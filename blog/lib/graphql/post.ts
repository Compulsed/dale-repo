import _ from 'lodash'
import { v4, validate } from 'uuid'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

// Custom imports
import { Post } from '../entities/Post'
import { getEnvironment } from '../utils/get-environment'
import { FilterQuery, QueryOrder } from '@mikro-orm/core'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { LambdaContext } from '../graphql-types'
import { invalidSecretError, validationError } from '../errors'
import { isSecret } from '../utils/secret'
import { Tag } from '../entities/Tag'

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
  urlStub: string
  body: string
  shortDescription: string
  longDescription: string
  imageUrl: string
  tags: string[]
}>

type UpdatePostResponse = {
  status: boolean
  errorMessage: string | null
  post: Post | null
}

export enum PublishStatus {
  Published = 'PUBLISHED',
  Hidden = 'HIDDEN',
  Draft = 'DRAFT',
}

// TODO: Consider changing the way errors are handled, errors array, errors body, or errors enums
const invalidSecretResponse = (): UpdatePostResponse => {
  return {
    status: false,
    errorMessage: 'Invalid Secret',
    post: null,
  }
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
    url: String
    urlStub: String
    shortDescription: String
    longDescription: String
    imageUrl: String
    createdAt: String
    updatedAt: String
    publishStatus: PublishStatus
    availableWithLink: Boolean
    tags: [Tag]
  }

  input PostInput {
    title: String
    body: String
    urlStub: String
    shortDescription: String
    longDescription: String
    imageUrl: String
    tags: [String!]
  }
  
  type UpdatePostResponse {
    status: Boolean!
    errorMessage: String
    post: Post
  }

  type Query {
    post(id: ID!): Post
    posts(tags: [String!]): [Post]
    editorPost(id: ID!, secret: String!): Post
    editorPosts(secret: String!, tags: [String!]): [Post]
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
    url: ({ urlStub, id }: Post) => `${id}/${urlStub}`,
    createdAt: ({ createdAt }: Post) => createdAt && new Date(createdAt).toISOString(),
    updatedAt: ({ updatedAt }: Post) => updatedAt && new Date(updatedAt).toISOString(),
    tags: async (post: Post, _root: any, __context: LambdaContext): Promise<Tag[]> => {
      return post.tags.loadItems()
    },
  },

  Query: {
    post: (_root: any, { id }: { id: string }, context: LambdaContext): Promise<Post> => {
      if (!validate(id)) {
        throw validationError('ID Format is not valid')
      }

      const postRepository = context.em.getRepository(Post)

      return postRepository.findOneOrFail({
        id: id,
        $or: [{ publishStatus: PublishStatus.Published }, { availableWithLink: true }],
      })
    },

    posts: (_root: any, { tags }: any, context: LambdaContext): Promise<Post[]> => {
      const postRepository = context.em.getRepository(Post)

      const searchObject: FilterQuery<Post> = {
        publishStatus: PublishStatus.Published,
      }

      if (tags) {
        searchObject.tags = {
          name: {
            $in: tags,
          },
        }
      }

      return postRepository.find(searchObject, { orderBy: { createdAt: QueryOrder.DESC } })
    },

    editorPost: (_root: any, { id, secret }: any, context: LambdaContext): Promise<Post> => {
      if (!isSecret(secret)) {
        throw invalidSecretError()
      }

      const postRepository = context.em.getRepository(Post)

      // TODO: Consider 404 handling
      return postRepository.findOneOrFail({
        id: id,
      })
    },

    editorPosts: (_root: any, { secret, tags }: any, context: LambdaContext): Promise<Post[]> => {
      if (!isSecret(secret)) {
        throw invalidSecretError()
      }

      const postRepository = context.em.getRepository(Post)

      const searchObject: FilterQuery<Post> = {}

      if (tags) {
        searchObject.tags = {
          name: {
            $in: tags,
          },
        }
      }

      return postRepository.find(searchObject, { orderBy: { createdAt: QueryOrder.DESC } })
    },

    editorSignedUrl: async (_root: any, { fileName, contentType, secret }: any) => {
      if (!isSecret(secret)) {
        throw invalidSecretError()
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
    createPost: async (_root: any, args: CreatePostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      if (!isSecret(args.secret)) {
        return invalidSecretResponse()
      }

      const postRepository = context.em.getRepository(Post)

      const postInput = _.pickBy(
        {
          // Pass through
          title: args.postInput.title,
          urlStub: args.postInput.urlStub,
          body: args.postInput.body,
          shortDescription: args.postInput.shortDescription,
          longDescription: args.postInput.longDescription,
          imageUrl: args.postInput.imageUrl,

          // Generated
          publishStatus: PublishStatus.Draft,
        },
        (value) => !_.isUndefined(value)
      )

      const post = postRepository.create(new Post(args.id ?? null, postInput))

      const tagRepository = context.em.getRepository(Tag)

      const tags = await tagRepository.find({
        name: {
          $in: args.postInput.tags || [],
        },
      })

      post.tags.add(tags)

      await postRepository.persistAndFlush([post])

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },

    updatePost: async (_root: any, args: UpdatePostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      if (!isSecret(args.secret)) {
        return invalidSecretResponse()
      }

      const postRepository = context.em.getRepository(Post)

      const post = await postRepository.findOneOrFail(args.id)

      const postInput = _.pickBy(
        {
          title: args.postInput.title,
          urlStub: args.postInput.urlStub,
          body: args.postInput.body,
          shortDescription: args.postInput.shortDescription,
          longDescription: args.postInput.longDescription,
          imageUrl: args.postInput.imageUrl,
        },
        (value) => !_.isUndefined(value)
      )

      Object.assign(post, postInput)

      const tagRepository = context.em.getRepository(Tag)

      const tags = await tagRepository.find({
        name: {
          $in: args.postInput.tags || [],
        },
      })

      post.tags.set(tags)

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },

    publishPost: async (_root: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
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

    hidePost: async (_root: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
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

    unhidePost: async (_root: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
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

    setAvailableWithLink: async (_root: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
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

    removeAvailableWithLink: async (
      _root: any,
      args: PostArgs,
      context: LambdaContext
    ): Promise<UpdatePostResponse> => {
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
