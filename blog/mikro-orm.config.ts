import { getOrmConfig } from './lib/orm-config'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation' // ES Modules import
import { getEnvironment } from './lib/utils/get-environment'

const secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' })

const cloudFormationClient = new CloudFormationClient({ region: 'us-east-1' })

export default Promise.resolve().then(async () => {
  const { STAGE } = getEnvironment(['STAGE'])

  const cfnCommand = new DescribeStacksCommand({
    StackName: `BlogInfrastructure-${STAGE}`,
  })

  const cfnResponse = await cloudFormationClient.send(cfnCommand)

  const secretArn = (cfnResponse?.Stacks as any)[0].Outputs.find(
    ({ OutputKey }: any) => OutputKey === 'DatabaseSecretArn'
  ).OutputValue

  const secretCommand = new GetSecretValueCommand({
    SecretId: secretArn,
  })

  const secret = await secretsManagerClient.send(secretCommand)

  const secretValues = JSON.parse(secret.SecretString ?? '{}')

  const ormConfig = getOrmConfig({
    host: 'localhost',
    dbName: secretValues.dbname,
    user: secretValues.username,
    password: secretValues.password,
    port: parseInt(secretValues.port, 10),
  })

  return ormConfig
})
