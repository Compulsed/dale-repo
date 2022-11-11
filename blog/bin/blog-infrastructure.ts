#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { BlogInfrastructure } from '../lib/blog-infrastructure'

const app = new cdk.App()

new BlogInfrastructure(app, 'BlogInfrastructure', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})
