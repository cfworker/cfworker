# cfworker web app demo

1. Install deps

   ```
   yarn install
   ```

2. Configure environment

   Create an `.env` and `.env.production` file with the following properties:

   ```
   # Cloudflare
   CLOUDFLARE_EMAIL=xxxxx@xxxx.com
   CLOUDFLARE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   CLOUDFLARE_ZONE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   CLOUDFLARE_ACCOUNT_ID=
   CLOUDFLARE_WORKERS_DEV_PROJECT=

   # Cosmos DB
   COSMOS_DB_ORIGIN=https://xxxxxxxxxx.documents.azure.com
   COSMOS_DB_MASTER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   COSMOS_DB_DATABASE=xxxxxxxxx

   # auth0
   AUTH0_DOMAIN=xxxxxxxxxx.auth0.com
   AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   AUTH0_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # Sentry
   SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxxxx

   # mailgun
   MAILGUN_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxx
   ```

## auth0

custom rules:

```js
function (user, context, callback) {
  const namespace = 'https://auth.cfworker.dev/';
  context.idToken[namespace + 'tenant'] = user.app_metadata.tenant || 'demo';
  callback(null, user, context);
}
```
