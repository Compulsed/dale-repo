# Dale Blog

**Setting up a new environment**

- `port-forward`
- `npx cdk deploy`
- `npx mikro-orm migration:create` -- Looks at current state of entities and creates any required migrations
- `npx mikro-orm migration:up` -- Depends on role / secret created from deployment

**Mikro Orm Notes**

The following is what I had to do to get ESBuild (Which CDK uses) with MikroOrm

https://mikro-orm.io/docs/deployment/#deploy-a-bundle-of-entities-and-dependencies-with-webpack

https://github.com/mikro-orm/mikro-orm/discussions/2219

**OTel Notes**

- Requires node modules in ESBuild to auto-instrument particular packages
  - Increases cold starts if some packages are excluded (unsure how much)
  - Only includes manual instrumentation, fs, exception, & some HTTP if we bundle these deps
- Lambda does not flush all traces, need to use a lambda extension
  - Issue with the lambda extension are they do not work with manual
    instrumentation (unsure how to access OTEL libraries provided by the layer)
  - [aws-otel-lambda](https://github.com/aws-observability/aws-otel-lambda) appears to be wanky due to missing XRay traces (not in HNY) / ESBuild (maybe the new telemtry API will help with this)
  - [opentelemetry-lambda](https://github.com/open-telemetry/opentelemetry-lambda/), have not tried. Requires building custom layer
  - Honeycomb-opentelemetry-node - is coming

**GraphQL Error Nodes**

- Non-nullability causes a critical GraphQL schema error
- HNY treats exceptions like "Span events"
- https://www.honeycomb.io/blog/uniting-tracing-logs-open-telemetry-span-events - Terms
  - Events can be thought of as similiar to log lines
- Can search for Span events using span based searchs

**TODO**

Setup:

- ✅ Improvements, support different database names
- ✅ Mikro cli fetches secret
- ✅ Support different stack deployments
- ✅ GraphQL connections
- ✅ GraphQL URL path
- ✅ OTel exports are not missed
- ✅ CI/CD Pipeline
- ✅ Custom domain name
- Local express support (https://www.apollographql.com/docs/apollo-server/deployment/lambda/#customizing-http-behavior)
- ✅ CDK Watch / Hotswap for feedback loops
- ✅ Break down main handler class
- ✅ Consider using 'internal' / 'client' errors to mask unknown errors in production
- ✅ Database roles https://constructs.dev/packages/cdk-rds-sql/v/2.0.0?lang=typescript
- Fix environment variables
  - .env's APP_DATABASE_SECRET_ARN is only available once the infra stack is run, can we pull this from the lambda environment variables? This is true of other values like the bucket name.
- Custom function for spans (with error setting for proper errors)
- Graph Resolver Caching
- Lambda init time tracing
- Frontend tracing
- Vercel headers (Stale-While-Revalidate)
- S3 backups

Bonus:

- Cloudfront for images
- GraphQL Subscriptions
