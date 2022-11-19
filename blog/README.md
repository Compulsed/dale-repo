# Dale Blog

The following is what I had to do to get ESBuild (Which CDK uses) with MikroOrm

https://mikro-orm.io/docs/deployment/#deploy-a-bundle-of-entities-and-dependencies-with-webpack

https://github.com/mikro-orm/mikro-orm/discussions/2219

**Setting up a new environment**

- `port-forward`
- `npx mikro-orm database:create`
- `npx mikro-orm migration:up`
- `npx cdk deploy`

**Running locally**

- `LOCAL_INVOKE=y npx ts-node ./lib/invoker.ts`

**TODO**

Setup:

- ✅ Improvements, support different database names
- ✅ Mikro cli fetches secret
- ✅ Support different stack deployments
- Local express support
- GraphQL connections
- Custom domain name
- GraphQL URL path
- CI/CD Pipeline

Replicating:

- Database migration
- Schema / query migration
