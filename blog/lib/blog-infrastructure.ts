import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { getEnvironment } from './utils/get-environment'

const { STAGE } = getEnvironment(['STAGE'])

// const { OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_HEADERS, OTEL_SERVICE_NAME } = getEnvironment([
//   'OTEL_EXPORTER_OTLP_ENDPOINT',
//   'OTEL_EXPORTER_OTLP_HEADERS',
//   'OTEL_SERVICE_NAME',
// ])

export class BlogInfrastructure extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const importedSecretArn = cdk.Fn.importValue('DatabaseSecretArn')

    const vpc = Vpc.fromLookup(this, 'Vpc', {
      vpcName: 'DatabaseInfrastructure/Vpc',
    })

    const secret = secretsManager.Secret.fromSecretCompleteArn(this, 'Secret', importedSecretArn)

    const apiFunction = new NodejsFunction(this, 'ApiFunction', {
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      memorySize: 1024,
      timeout: Duration.seconds(30),
      entry: __dirname + '/blog-infrastructure-lambda.function.ts',
      environment: {
        STAGE,
        DATABASE_SECRET_ARN: secret.secretFullArn ?? '',

        // Otel configuration
        // OTEL_EXPORTER_OTLP_ENDPOINT,
        // OTEL_EXPORTER_OTLP_HEADERS,
        // OTEL_SERVICE_NAME,
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
        OPENTELEMETRY_COLLECTOR_CONFIG_FILE: '/var/task/collector.yaml',
      },
      tracing: lambda.Tracing.ACTIVE,
      bundling: {
        preCompilation: true, // Runs TSC before deploying

        nodeModules: [
          // Required for 2 reasons
          //  - Fixes an issue with '@opentelemetry/sdk-node' -> thriftrw -> bufrw throwing an error on function initialization
          //  - OTEL does not work if `sdk-node` and `auto-instrumentations-node` are not included
          '@opentelemetry/api',
          '@opentelemetry/sdk-node',
          '@opentelemetry/auto-instrumentations-node',
          '@opentelemetry/exporter-trace-otlp-proto',

          // Requires these to be installed as node_modules otherwise
          //  auto-instrumentation does not work. Impacts of including = ~700ms - 1s to cold start
          'graphql',
          'pg',
          '@aws-sdk/client-secrets-manager',
        ],

        externalModules: [
          // pg imports
          'pg-native',

          // Mikro-orm imports -- is there a better way?
          '@mikro-orm/entity-generator',
          '@mikro-orm/seeder',
          'sqlite3',
          'better-sqlite3',
          'mysql',
          'mysql2',
          'oracledb',
          '@mikro-orm/mongodb',
          '@mikro-orm/mysql',
          '@mikro-orm/mariadb',
          'pg-query-stream',
          '@mikro-orm/sqlite',
          '@mikro-orm/better-sqlite',
          'tedious',
        ],

        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [`cp ${inputDir}/collector.yaml ${outputDir}`]
          },
          afterBundling(): string[] {
            return []
          },
          beforeInstall() {
            return []
          },
        },

        inject: ['./lib/esbuild-mikroorm-patch.ts'],
      },
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          this,
          'otel-layer',
          'arn:aws:lambda:us-east-1:901920570463:layer:aws-otel-nodejs-arm64-ver-1-7-0:2'
        ),
      ],
    })

    secret?.grantRead(apiFunction)

    new LambdaRestApi(this, 'ApiGateway', {
      handler: apiFunction,
      deployOptions: {
        stageName: 'graphql',
      },
    })
  }
}
