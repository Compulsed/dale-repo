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
import { CfnOutput, Duration } from 'aws-cdk-lib'

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

    const dbInstance = new rds.DatabaseInstance(this, 'PostgresDatabaseInstance', {
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      vpc,
      deletionProtection: false,
      vpcSubnets: vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_ISOLATED,
      }),
      securityGroups: [dbSecurityGroup],
      autoMinorVersionUpgrade: true,
      publiclyAccessible: false,
      backupRetention: cdk.Duration.days(30),
      instanceType: new InstanceType('t4g.micro'),
      port: 5432,
      allocatedStorage: 20,
    })

    const bastion = new BastionHostLinux(this, 'BastionHost', {
      vpc,
      instanceType: new InstanceType('t2.nano'),
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
        databaseSecretArn: dbInstance.secret?.secretFullArn ?? '',
      },
      bundling: {
        externalModules: ['pg-native'],
      },
      vpc,
      vpcSubnets: vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
    })

    dbInstance.secret?.grantRead(apiFunction)

    new LambdaRestApi(this, 'ApiGateway', {
      handler: apiFunction,
    })

    new CfnOutput(this, 'BastionInstanceId', {
      value: bastion.instanceId,
    })

    new CfnOutput(this, 'DatabaseSecretArn', {
      value: dbInstance.secret?.secretFullArn ?? '',
      exportName: 'DatabaseSecretArn',
    })

    new CfnOutput(this, 'VpcName', {
      value: dbInstance.secret?.secretFullArn ?? '',
      exportName: 'VpcName',
    })
  }
}
