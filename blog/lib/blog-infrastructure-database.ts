import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Vpc } from 'aws-cdk-lib/aws-ec2'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'
import { getEnvironment } from './utils/get-environment'
import { AuroraPostgresEngineVersion, DatabaseCluster, DatabaseClusterEngine } from 'aws-cdk-lib/aws-rds'
import { Provider, Role, Database } from 'cdk-rds-sql'
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager'

const { STAGE } = getEnvironment(['STAGE'])

export class BlogInfrastructureDatabase extends cdk.Stack {
  databaseSecret: ISecret

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // TODO: Can we import any of these from the infra stack?
    const databaseName = `blog-${STAGE}`
    const databaseRoleName = `blog-${STAGE}-role`

    const vpc = Vpc.fromLookup(this, 'Vpc', {
      vpcName: 'DatabaseInfrastructure/Vpc',
    })

    const adminSecretArn = cdk.Fn.importValue('DatabaseSecretArn')

    const adminSecret = secretsManager.Secret.fromSecretCompleteArn(this, 'Secret', adminSecretArn)

    // Database
    const dbCluster = DatabaseCluster.fromDatabaseClusterAttributes(this, 'DbCluster', {
      clusterIdentifier: adminSecret.secretValueFromJson('dbClusterIdentifier').unsafeUnwrap(),
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_13_6,
      }),
      port: adminSecret.secretValueFromJson('port').unsafeUnwrap() as any,
      clusterEndpointAddress: adminSecret.secretValueFromJson('host').unsafeUnwrap(),
    })

    const provider = new Provider(this, 'Provider', {
      vpc: vpc,
      cluster: dbCluster,
      secret: adminSecret,
    })

    const dbRole = new Role(this, 'Role', {
      provider: provider,
      roleName: databaseRoleName,
      databaseName: databaseName,
    })

    new Database(this, 'Database', {
      provider: provider,
      databaseName: databaseName,
      owner: dbRole,
    })

    this.databaseSecret = dbRole.secret
  }
}
