import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Cors, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'
import { Architecture, LayerVersion, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import { ARecord, PublicHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'
import { CfnOutput, Duration } from 'aws-cdk-lib'
import { getEnvironment } from './utils/get-environment'
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager'
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets'
import { Bucket, BucketAccessControl, HttpMethods } from 'aws-cdk-lib/aws-s3'
import { AnyPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager'

const { STAGE, OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_HEADERS, OTEL_SERVICE_NAME } = getEnvironment([
  'STAGE',
  'OTEL_EXPORTER_OTLP_ENDPOINT',
  'OTEL_EXPORTER_OTLP_HEADERS',
  'OTEL_SERVICE_NAME',
])

interface BlogInfrastructureStackProps extends cdk.StackProps {
  databaseSecret: ISecret
}

export class BlogInfrastructure extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BlogInfrastructureStackProps) {
    super(scope, id, props)

    // TODO: Can we import any of these from the infra stack?
    const hostedZoneId = 'Z05982951JTEV3EHAO42B'
    const rootName = 'api-blog.dalejsalter.com'
    const recordName = STAGE
    const domainName = `${recordName}.${rootName}`

    const vpc = Vpc.fromLookup(this, 'Vpc', {
      vpcName: 'DatabaseInfrastructure/Vpc',
    })

    const databaseSecret = props.databaseSecret

    // DNS
    const zone = PublicHostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId,
      zoneName: rootName,
    })

    const certificate = new Certificate(this, 'Certificate', {
      domainName,
      validation: CertificateValidation.fromDns(zone),
    })

    // S3 Bucket
    const imageBucket = new Bucket(this, 'ImageBucket', {
      transferAcceleration: true,
      accessControl: BucketAccessControl.PUBLIC_READ,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [HttpMethods.PUT],
          allowedOrigins: ['*'],
        },
      ],
    })

    imageBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [`${imageBucket.bucketArn}/*`],
        principals: [new AnyPrincipal()],
      })
    )

    const apiFunction = new NodejsFunction(this, 'ApiFunction', {
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      memorySize: 1536,
      timeout: Duration.seconds(30),
      entry: __dirname + '/blog-infrastructure-lambda.function.ts',
      tracing: Tracing.PASS_THROUGH,
      environment: {
        STAGE,
        IMAGE_BUCKET_NAME: imageBucket.bucketName,
        DATABASE_SECRET_ARN: databaseSecret.secretArn,
        // https://github.com/aws-observability/aws-otel-lambda/issues/361
        OTEL_PROPAGATORS: 'tracecontext',
        OTEL_EXPORTER_OTLP_ENDPOINT,
        OTEL_EXPORTER_OTLP_HEADERS,
        OTEL_SERVICE_NAME,
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
        OPENTELEMETRY_COLLECTOR_CONFIG_FILE: '/var/task/collector.yaml',
      },
      layers: [
        LayerVersion.fromLayerVersionArn(
          this,
          'otel-layer',
          'arn:aws:lambda:us-east-1:901920570463:layer:aws-otel-nodejs-arm64-ver-1-7-0:2'
        ),
      ],
      bundling: {
        preCompilation: true, // Runs TSC before deploying
        keepNames: true, // This option might do something

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

        nodeModules: [
          // Requires these to be installed as node_modules otherwise
          //  auto-instrumentation does not work. Impacts of including = ~700ms - 1s to cold start
          'graphql',
          'pg',
          '@aws-sdk/client-secrets-manager',
          '@aws-sdk/client-s3',
        ],

        externalModules: [
          // pg imports
          'pg-native',

          // TODO: Support local otel
          '@opentelemetry/api',
          '@opentelemetry/sdk-node',
          '@opentelemetry/auto-instrumentations-node',

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

    databaseSecret.grantRead(apiFunction)

    imageBucket.grantPut(apiFunction)

    const api = new LambdaRestApi(this, 'ApiGateway', {
      handler: apiFunction,
      deployOptions: {
        stageName: 'graphql',
      },
      domainName: {
        certificate,
        domainName,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowCredentials: true,
      },
    })

    new ARecord(this, 'APIGatewayRecord', {
      zone: zone,
      target: RecordTarget.fromAlias(new ApiGateway(api)),
      recordName: recordName,
    })

    new CfnOutput(this, 'DatabaseSecretArn', {
      exportName: `BlogInfrastructure-${STAGE}-DatabaseSecretArn`,
      value: databaseSecret.secretArn,
    })
  }
}
