import { APIGatewayProxyEventV2 } from 'aws-lambda'

const handler = require('./blog-infrastructure-lambda.function')

const _gqlCreateMutation = () => {
  const query = `
    mutation (
      $createPostPostInput: PostInput!
      $createPostSecret: String!
    ) {
      createPost(
        postInput: $createPostPostInput
        secret: $createPostSecret
      ) {
        errorMessage
        status
        post {
          id
          title
          updatedAt
          createdAt
        }
      }
    }
  `

  const variables = {
    createPostPostInput: {
      title: 'tags',
      tags: ['cdk'],
    },
    createPostSecret: 'daleisadmin',
  }

  return { query, variables }
}

const _gqlUpdateMutation = () => {
  const query = `
    mutation (
      $updatePostId: ID!
      $updatePostPostInput: PostInput!
      $updatePostSecret: String!
    ) {
      updatePost(
        id: $updatePostId
        postInput: $updatePostPostInput
        secret: $updatePostSecret
      ) {
        errorMessage
        status
        post {
          id
          title
          updatedAt
          createdAt
        }
      }
    }  
  `

  const variables = {
    updatePostId: '69ece5b7-bf54-4131-b863-56ede1f071dc',
    updatePostPostInput: {
      title: 'leadership-update',
      tags: ['cdk', 'leadership'],
    },
    updatePostSecret: 'daleisadmin',
  }

  return { query, variables }
}

const _gqlQuery = () => {
  const query = `
    query QueryPosts($secret: String!) {
      editorPosts(secret: $secret) {
        title
        id
        tags {
          id
          name
        }
      }
    }
  `

  const variables = {
    secret: 'daleisadmin',
  }

  return { query, variables }
}

const _gqlTagQuery = () => {
  const query = `
    query QueryPosts($secret: String!, $tags: [String!]) {
      editorPosts(secret: $secret, tags: $tags) {
        title
        id
        tags {
          id
          name
        }
      }
    }
  `

  const variables = {
    secret: 'daleisadmin',
    tags: ['cdk'],
  }

  return { query, variables }
}

;(async () => {
  // const { query, variables } = _gqlCreateMutation()
  // const { query, variables } = _gqlUpdateMutation()
  // const { query, variables } = _gqlQuery()
  const { query, variables } = _gqlTagQuery()

  const body = {
    query,
    variables,
    operationName: null,
  }

  const event: APIGatewayProxyEventV2 = {
    headers: {
      'content-type': 'application/json',
    },
    requestContext: {
      accountId: '',
      apiId: '',
      domainName: '',
      domainPrefix: '',
      http: {
        method: 'POST',
        path: '/',
        protocol: '',
        sourceIp: '',
        userAgent: '',
      },
      requestId: '',
      routeKey: '',
      stage: '',
      time: '',
      timeEpoch: 0,
    },
    body: JSON.stringify(body),
    version: '',
    routeKey: '',
    rawPath: '',
    rawQueryString: '',
    isBase64Encoded: false,
  }

  const context: any = {}

  const cb: any = {}

  const response = await handler.handler(event, context, cb)

  // eslint-disable-next-line no-console
  console.log(response)

  // process.exit(0)
})()
