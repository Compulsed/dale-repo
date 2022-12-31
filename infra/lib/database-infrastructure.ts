import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import * as rds from 'aws-cdk-lib/aws-rds'
import {
  InstanceType,
  SecurityGroup,
  SubnetType,
  Vpc,
  Peer,
  Port,
  BastionHostLinux,
  NatProvider,
} from 'aws-cdk-lib/aws-ec2'
import { Aspects, CfnOutput, Duration } from 'aws-cdk-lib'
import { CfnDBCluster } from 'aws-cdk-lib/aws-rds'

export class DatabaseInfrastructure extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const natGatewayProvider = NatProvider.instance({
      instanceType: new InstanceType('t3.nano'),
    })

    const vpc = new Vpc(this, 'Vpc', {
      cidr: '10.0.0.0/16',
      subnetConfiguration: [
        { name: 'public', subnetType: SubnetType.PUBLIC },
        { name: 'private-egress', subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        { name: 'private-isolated', subnetType: SubnetType.PRIVATE_ISOLATED },
      ],
      natGateways: 1,
      natGatewayProvider,
    })

    const dbSecurityGroup = new SecurityGroup(this, 'DbSecurityGroup', {
      vpc: vpc,
      allowAllOutbound: true,
    })

    // TODO: Consider if this is needed, it might be because that's what EC2 uses
    dbSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(5432), 'Allow internet to read / write to aurora')

    // Full spec https://github.com/aws/aws-cdk/issues/20197#issuecomment-1117555047
    const dbCluster = new rds.DatabaseCluster(this, 'DbCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_13_6,
      }),
      deletionProtection: true,
      instances: 1,
      instanceProps: {
        vpc: vpc,
        instanceType: new InstanceType('serverless'),
        autoMinorVersionUpgrade: true,
        publiclyAccessible: false,
        securityGroups: [dbSecurityGroup],
        vpcSubnets: vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_ISOLATED,
        }),
        enablePerformanceInsights: true,
      },
      backup: {
        retention: cdk.Duration.days(30),
      },
      port: 5432,
    })

    Aspects.of(dbCluster).add({
      visit(node) {
        if (node instanceof CfnDBCluster) {
          node.serverlessV2ScalingConfiguration = {
            minCapacity: 0.5,
            maxCapacity: 1,
          }
        }
      },
    })

    const bastion = new BastionHostLinux(this, 'BastionHost', {
      vpc,
      subnetSelection: vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
    })

    const apiFunction = new NodejsFunction(this, 'ApiFunction', {
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(30),
      entry: __dirname + '/database-infrastructure-lambda.function.ts',
      environment: {
        databaseSecretArn: dbCluster.secret?.secretFullArn ?? '',
      },
      bundling: {
        externalModules: ['pg-native'],
      },
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
    })

    dbCluster.secret?.grantRead(apiFunction)

    new LambdaRestApi(this, 'ApiGateway', {
      handler: apiFunction,
    })

    new CfnOutput(this, 'BastionInstanceId', {
      value: bastion.instanceId,
    })

    new CfnOutput(this, 'DatabaseSecretArn', {
      value: dbCluster.secret?.secretFullArn ?? '',
      exportName: 'DatabaseSecretArn',
    })

    new CfnOutput(this, 'AdminDatabaseSecretArn', {
      value: dbCluster.secret?.secretFullArn ?? '',
      exportName: 'AdminDatabaseSecretArn',
    })

    new CfnOutput(this, 'VpcName', {
      value: dbCluster.secret?.secretFullArn ?? '',
      exportName: 'VpcName',
    })
  }
}
