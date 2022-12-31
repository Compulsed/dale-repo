const handler = require('./blog-infrastructure-lambda.function')

;(async () => {
  const query = `
    query($postId: ID!) {
      post(id: $postId) {
        id
      }
    }
  `

  const variables = {
    postId: 'aaa',
  }

  const body = {
    query,
    variables,
    operationName: null,
  }

  const event: any = {
    httpMethod: 'POST',
    path: '/',
    headers: {
      'content-type': 'application/json',
    },
    requestContext: {},
    body: JSON.stringify(body),
  }

  const context: any = {}

  const cb: any = {}

  const response = await handler.handler(event, context, cb)

  // eslint-disable-next-line no-console
  console.log(response)

  // process.exit(0)
})()
