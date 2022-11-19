import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'
import { Duration } from 'aws-cdk-lib'
import { getEnvironment } from './utils/get-environment'

const { STAGE } = getEnvironment(['STAGE'])

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
      timeout: Duration.seconds(30),
      entry: __dirname + '/blog-infrastructure-lambda.function.ts',
      environment: {
        STAGE,
        DATABASE_SECRET_ARN: secret.secretFullArn ?? '',
      },
      bundling: {
        preCompilation: true, // Runs TSC before deploying

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

    new LambdaRestApi(this, 'ApiGateway', {
      handler: apiFunction,
    })
  }
}
