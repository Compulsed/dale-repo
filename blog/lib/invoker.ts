import { handler } from './blog-infrastructure-lambda.function'
;(async () => {
  const event: any = {
    httpMethod: 'POST',
    path: '/',
    headers: {
      'content-type': 'application/json',
    },
    requestContext: {},
    body: '{"operationName": null, "variables": null, "query": "{ books { title } }"}',
  }

  const context: any = {}

  const cb: any = {}

  const response = await handler(event, context, cb)

  console.log(response)

  // process.exit(0)
})()
