import 'source-map-support/register'

import { sdkInit, tracer } from './otel'

// All other deps
import _ from 'lodash'
import { APIGatewayEvent, Context } from 'aws-lambda'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { MikroORM, SqlEntityManager } from '@mikro-orm/postgresql'
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateLambdaHandler } from '@as-integrations/aws-lambda'

// Custom imports
import { Post } from './entities/Post'
import { getOrmConfig } from './orm-config'
import { getEnvironment } from './utils/get-environment'
import { QueryOrder } from '@mikro-orm/core'

const getOrm = _.memoize(async () => {
  const secret = await tracer.startActiveSpan('get-secret', async (span) => {
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
  const orm = await tracer.startActiveSpan('orm-init', async (span) => {
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
  }

  type Post {
    id: ID!
    postId: String
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
    post(postId: String!): Post
    posts: [Post]
    editorPost(postId: String!, secret: String!): Post
    editorPosts(secret: String!): [Post]
    editorSignedUrl(fileName: String!, secret: String!, contentType: String!): String
  }

  input PostInput {
    postId: String!
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
    createPost (postInput: PostInput!, secret: String!): UpdatePostResponse!
    updatePost (postInput: PostInput!, secret: String!): UpdatePostResponse!
    publishPost (postId: String!, secret: String!): UpdatePostResponse!
    hidePost (postId: String!, secret: String!): UpdatePostResponse!
    unhidePost (postId: String!, secret: String!): UpdatePostResponse!
    setAvailableWithLink (postId: String!, secret: String!): UpdatePostResponse!
    removeAvailableWithLink (postId: String!, secret: String!): UpdatePostResponse!
  }
`

type LambdaContext = {
  em: SqlEntityManager<PostgreSqlDriver>
}

type PostArgs = {
  postInput: PostInput
  secret: string
}

type PostInput = Partial<{
  postId: string
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
}

const resolvers = {
  Query: {
    hello: (_: any, __: any, ___: LambdaContext) => {
      return 'world'
    },

    post: (_: any, { postId }: { postId: string }, context: LambdaContext): Promise<Post> => {
      const postRepository = context.em.getRepository(Post)

      // TODO: Consider 404 handling
      return postRepository.findOneOrFail({
        postId: postId,
        availableWithLink: true,
        publishStatus: PublishStatus.Published,
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

    editorPost: (_: any, { postId }: { postId: string }, context: LambdaContext): Promise<Post> => {
      const postRepository = context.em.getRepository(Post)

      // TODO: Consider 404 handling
      return postRepository.findOneOrFail({
        postId: postId,
        availableWithLink: true,
      })
    },

    editorPosts: (_: any, __: any, context: LambdaContext): Promise<Post[]> => {
      const postRepository = context.em.getRepository(Post)

      return postRepository.find({}, { orderBy: { createdAt: QueryOrder.DESC } })
    },
  },

  Mutation: {
    createPost: async (_: any, args: PostArgs, context: LambdaContext): Promise<UpdatePostResponse> => {
      const postRepository = context.em.getRepository(Post)

      const post = postRepository.create(new Post(args.postInput))

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },

    publishPost: async (_: any, { postId }: { postId: string }, context: LambdaContext) => {
      const postRepository = context.em.getRepository(Post)

      const post = await postRepository.findOneOrFail({
        postId: postId,
      })

      post.publishStatus = PublishStatus.Published

      await postRepository.persistAndFlush(post)

      return {
        status: true,
        errorMessage: null,
        post: post,
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// TODO: Consider putting this inside the handler & caching for otel insights
//  or use a `inject` to ensure the otel SDK is loaded before this file
const serverHandler = startServerAndCreateLambdaHandler(server, {
  context: async ({ event, context }) => {
    const orm = await tracer.startActiveSpan('orm-setup', async (span) => {
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

/* Performance:
    p50 ~3.3 - 3.7s
      - ~2s pg-connect
      - ~1.3-1.7s OTel init, js module, apollo server, etc
*/
export const handler = async (event: APIGatewayEvent, context: Context, cb: any): Promise<any> => {
  await sdkInit

  const response = await tracer.startActiveSpan('handler', async (span) => {
    const response = await serverHandler(event, context, cb)

    span.end()

    return response
  })

  return response
}
