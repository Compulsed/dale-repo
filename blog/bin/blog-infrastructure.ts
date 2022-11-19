#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { BlogInfrastructure } from '../lib/blog-infrastructure'
import { getEnvironment } from '../lib/utils/get-environment'

const app = new cdk.App()

const { STAGE } = getEnvironment(['STAGE'])

new BlogInfrastructure(app, `BlogInfrastructure-${STAGE}`, {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
