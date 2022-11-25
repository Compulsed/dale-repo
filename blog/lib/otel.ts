/*
  For local + lambda telemetry we must handle both cases in very different ways
  
  Lambda:
    - Handles most of the initialization via the layer. All we need to do
      is pass around the tracer

  Local:
    - Local manages the spans 'in process', for local to correctly work
      we need to fully initialize the Otel Node SDK

  As the OTEL libraries do not handle ESM (Models), we must use require as 
    that is a common denominator between Otel + Lambda
*/
const api = require('@opentelemetry/api')

export const tracer = api.trace.getTracer('blog-lambda-tracer')

export let sdkInit = Promise.resolve()

if (process.env['LOCAL_INVOKE']) {
  const { NodeSDK } = require('@opentelemetry/sdk-node')
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto')

  const traceExporter = new OTLPTraceExporter()

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Creates too much noise in spans
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      }),
    ],
  })

  api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.WARN)

  // Must call await on this method, otherwise traces go missing
  sdkInit = sdk
    .start()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Tracing initialized')
    })
    .catch((error: any) => {
      // eslint-disable-next-line no-console
      console.log('Error initializing tracing', error)
    })
}
