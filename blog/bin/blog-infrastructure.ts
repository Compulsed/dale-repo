#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { BlogInfrastructure } from '../lib/blog-infrastructure'
import { BlogInfrastructureDatabase } from '../lib/blog-infrastructure-database'
import { Stage, StageProps } from 'aws-cdk-lib'

import { getEnvironment } from '../lib/utils/get-environment'
import { Construct } from 'constructs'

const app = new cdk.App()

const { STAGE } = getEnvironment(['STAGE'])

class BlogInfrastructureStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props)

    const blogInfraDatabase = new BlogInfrastructureDatabase(app, `BlogInfrastructureDatabase-${STAGE}`, {
      terminationProtection: STAGE === 'prod',
      env: props.env,
    })

    new BlogInfrastructure(app, `BlogInfrastructure-${STAGE}`, {
      env: props.env,
      terminationProtection: STAGE === 'prod',
      databaseSecret: blogInfraDatabase.databaseSecret,
    })
  }
}

new BlogInfrastructureStage(app, 'BlogInfrastructureStage', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  stageName: STAGE,
})
