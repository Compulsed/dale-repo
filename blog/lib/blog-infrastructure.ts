import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import { ARecord, PublicHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'
import { Duration } from 'aws-cdk-lib'
import { getEnvironment } from './utils/get-environment'
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager'
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets'

const { STAGE, OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_HEADERS, OTEL_SERVICE_NAME } = getEnvironment([
  'STAGE',
  'OTEL_EXPORTER_OTLP_ENDPOINT',
  'OTEL_EXPORTER_OTLP_HEADERS',
  'OTEL_SERVICE_NAME',
])

export class BlogInfrastructure extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const rootName = 'api-blog.dalejsalter.com'
    const recordName = STAGE
    const domainName = `${recordName}.${rootName}`

    const importedSecretArn = cdk.Fn.importValue('DatabaseSecretArn')

    // TODO: Import from Infra stack?
    const vpc = Vpc.fromLookup(this, 'Vpc', {
      vpcName: 'DatabaseInfrastructure/Vpc',
    })

    const secret = secretsManager.Secret.fromSecretCompleteArn(this, 'Secret', importedSecretArn)

    const zone = PublicHostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: 'Z05982951JTEV3EHAO42B', // TODO: Import from Infra stack
      zoneName: rootName,
    })

    const certificate = new Certificate(this, 'Certificate', {
      domainName,
      validation: CertificateValidation.fromDns(zone),
    })

    const apiFunction = new NodejsFunction(this, 'ApiFunction', {
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      memorySize: 1024,
      timeout: Duration.seconds(30),
      entry: __dirname + '/blog-infrastructure-lambda.function.ts',
      environment: {
        STAGE,
        OTEL_EXPORTER_OTLP_ENDPOINT,
        OTEL_EXPORTER_OTLP_HEADERS,
        OTEL_SERVICE_NAME,
        DATABASE_SECRET_ARN: secret.secretFullArn ?? '',
      },
      bundling: {
        preCompilation: true, // Runs TSC before deploying

        nodeModules: [
          // Required for 2 reasons
          //  - Fixes an issue with '@opentelemetry/sdk-node' -> thriftrw -> bufrw throwing an error on function initialization
          //  - OTEL does not work if `sdk-node` and `auto-instrumentations-node` are not included
          '@opentelemetry/api',
          '@opentelemetry/sdk-node',
          '@opentelemetry/auto-instrumentations-node',

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
        inject: ['./lib/esbuild-mikroorm-patch.ts'],
      },
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
    })

    secret?.grantRead(apiFunction)

    const api = new LambdaRestApi(this, 'ApiGateway', {
      handler: apiFunction,
      deployOptions: {
        stageName: 'graphql',
      },
      domainName: {
        certificate,
        domainName,
      },
    })

    new ARecord(this, 'APIGatewayRecord', {
      zone: zone,
      target: RecordTarget.fromAlias(new ApiGateway(api)),
      recordName: recordName,
    })
  }
}
