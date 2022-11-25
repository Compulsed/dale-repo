const handler = require('./blog-infrastructure-lambda.function')

;(async () => {
  const event: any = {
    httpMethod: 'POST',
    path: '/',
    headers: {
      'content-type': 'application/json',
    },
    requestContext: {},
    body: '{"operationName": null, "variables": null, "query": "{ posts { id } }"}',
  }

  const context: any = {}

  const cb: any = {}

  const response = await handler(event, context, cb)

  // eslint-disable-next-line no-console
  console.log(response)

  // process.exit(0)
})()
