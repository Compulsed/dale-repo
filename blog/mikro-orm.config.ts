import { getOrmConfig } from './lib/orm-config'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

const secretsManagerClient = new SecretsManagerClient({ region: 'us-east-1' })

export default Promise.resolve().then(async () => {
  const secretArn = process.env.DATABASE_SECRET_ARN

  const command = new GetSecretValueCommand({
    SecretId: secretArn,
  })

  const secret = await secretsManagerClient.send(command)

  const secretValues = JSON.parse(secret.SecretString ?? '{}')

  const ormConfig = getOrmConfig({
    host: 'localhost',
    user: secretValues.username,
    password: secretValues.password,
    port: parseInt(secretValues.port, 10),
  })

  return ormConfig
})
