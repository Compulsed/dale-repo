import 'source-map-support/register'

import _ from 'lodash'
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { MikroORM, SqlEntityManager } from '@mikro-orm/postgresql'
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda'
import { v4 } from 'uuid'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

// Custom imports
import { sdkInit, SpanStatusCode, trace, tracer } from './otel'
import { Post } from './entities/Post'
import { getOrmConfig } from './orm-config'
import { getEnvironment } from './utils/get-environment'
import { QueryOrder } from '@mikro-orm/core'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GraphQLError } from 'graphql'

const getOrm = _.memoize(async () => {
  const secret = await tracer.startActiveSpan('get-secret', async (span: any) => {
    const secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' })

    const { DATABASE_SECRET_ARN } = getEnvironment(['DATABASE_SECRET_ARN'])

    const command = new GetSecretValueCommand({
      SecretId: DATABASE_SECRET_ARN,
    })

    const secret = await secretsManagerClient.send(command)

    span.end()

    return secret
  })

  const secretValues = JSON.parse(secret.SecretString ?? '{}')

  const host = process.env.LOCAL_INVOKE ? 'localhost' : secretValues.host

  const ormConfig = getOrmConfig({
    user: secretValues.username,
    host: host,
    password: secretValues.password,
    port: parseInt(secretValues.port, 10),
  })

  // 600ms - 2s to initialize on cold-start due to pg-connect
  const orm = await tracer.startActiveSpan('orm-init', async (span: any) => {
    const orm = await MikroORM.init<PostgreSqlDriver>(ormConfig)
    span.end()
    return orm
  })

  return orm
})

const typeDefs = `#graphql
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

  type Query {
    hello: String!
    rawError: String
    graphQLError: String

    post(id: ID!): Post
    posts: [Post]
    editorPost(id: ID!, secret: String!): Post
    editorPosts(secret: String!): [Post]
    editorSignedUrl(fileName: String!, secret: String!, contentType: String!): String
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

type LambdaContext = {
  em: SqlEntityManager<PostgreSqlDriver>
}

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

const resolvers = {
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

// ApolloServer generates `graphql.parseSchema` spans. To ensure they're captured
//  in Hny, initialize in the lambda handler, & cache for subsequent requests
const serverHandler = _.memoize(() => {
  const { STAGE } = getEnvironment(['STAGE'])

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: STAGE !== 'prod',
  })

  return startServerAndCreateLambdaHandler(server, {
    context: async ({ event, context }) => {
      const orm = await tracer.startActiveSpan('orm-setup', async (span: any) => {
        const orm = await getOrm()
        span.end()
        return orm
      })

      const em = orm.em.fork()

      return {
        lambdaEvent: event,
        lambdaContext: context,
        em,
      }
    },
  })
})

/* Performance:
    p50 ~3.3 - 3.7s
      - ~2s pg-connect
      - ~1.3-1.7s OTel init, js module, apollo server, etc
*/
const handler = async (event: APIGatewayEvent, context: Context, cb: any): Promise<any> => {
  await sdkInit

  const response = await tracer.startActiveSpan('handler', { root: true }, async (span: any) => {
    const response = (await serverHandler()(event, context, cb)) as APIGatewayProxyResult

    // TODO: Looks like CORS is meant to be provided by serverless express
    //    https://www.apollographql.com/docs/apollo-server/deployment/lambda/
    //  Likely do not need CORS, so we are defining our own headers
    response['headers'] = Object.assign({}, response['headers'], {
      'access-control-allow-methods': 'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD',
      'access-control-allow-origin': '*',
      'access-control-allow-headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
      'access-control-allow-credentials': 'true',
    })

    span.end()

    return response
  })

  return response
}

module.exports = { handler }
