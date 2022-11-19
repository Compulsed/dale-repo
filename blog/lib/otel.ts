// Otel
import opentelemetry, { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import _ from 'lodash'

const traceExporter = new OTLPTraceExporter()

export const sdk = new NodeSDK({
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

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN)

export const getOtelSdk = _.memoize(async () => {
  return sdk.start()
})
