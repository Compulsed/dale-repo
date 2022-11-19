import { handler } from './blog-infrastructure-lambda.function'
;(async () => {
  const event: any = {}
  const context: any = {}

  const response = await handler(event, context)

  console.log(response)
})()
