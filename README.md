# Dale Repo

Stores all of Dale's projects that depend on an RDBMS

Shared:

- VPC (isolated, public networks)
- EC2 for Nat Gateway / Bastion host
  - I think there is a CDK for this now
  - SSM Systems manager, ssh port forwarding
- Aurora instance
- Exports
  - User / password / host, etc

Isolated:

- CDK project with own deps
- Lambda deployed into VPC ID
- Security groups

Limitations:

- Lambda triggers in aurora

**Dependencies**

- AWS Cli
- AWS Cli Systems manager
- Jq
- NodeJS

**Commands:**

SSM

```
aws ssm start-session --target "i-024761b22a70b2114"
aws ssm start-session --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{"host":["serverlessauroralambda-dbcluster224236ef-wmudazlvx4hc.cluster-cp1pjbcco8nm.us-east-1.rds.amazonaws.com"],"portNumber":["5432"], "localPortNumber":["5432"]}' --target "i-04c2d1f249147eb37"
```

Postgres

```
psql -h "serverlessaurora-dbcluster224236ef-jy7omaryufw2.cluster-cp1pjbcco8nm.us-east-1.rds.amazonaws.com" -U "postgres"
```
