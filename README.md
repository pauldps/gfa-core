# @gf-apis/sessions-core

This is the base project for [@gf-apis/sessions-api](https://github.com/gf-apis/sessions-api) without the external dependencies.

Use this library if you do __not__ want to use either Google Datastore, Bcrypt, or Client Sessions.

## Adapters

Each major functionality of this library (session control, password verification, database manipulation, and routing) relies on an adapter.

Since this library has no dependencies, you need to require and configure the adapters manually:

```javascript
const ClientSessionsAdapter = require('@gf-apis/client-sessions-adapter')
const sessionAdapter = new ClientSessionsAdapter({
  secret: 'MYSECRET',
  // ... session settings go here
})

const GoogleDatastoreAdapter = require('@gf-apis/datastore-adapter')
const databaseAdapter = new GoogleDatastoreAdapter({
  // ... database settings go here
})

const BcryptAdapter = require('@gf-apis/bcrypt-adapter')
const passwordAdapter = new BcryptAdapter({
  // ... password settings go here
})

const ExpressRouterAdapter = require('@gf-apis/express-router-adapter')
const routerAdapter = new ExpressRouterAdapter({
  // ... router settings go here
})

const Authorizer = require('@gf-apis/sessions-core')
const authorizer = new Authorizer({
  session: sessionAdapter,
  database: databaseAdapter,
  password: passwordAdapter,
  router: routerAdapter
})

exports.handleRequest = function (req, res) {
  authorizer.handle(req, res)
}
```

You can also create your own adapters. This library provides base classes for your new adapters to extend from:

### SessionAdapter

This adapter handles client sessions and validates session credentials.

If you prefer JWT tokens instead of cookies, you can create a new adapter here.

### DatabaseAdapter

This adapter handles database operations, such as queries, insertions, updates, etc.

If you prefer MySQL or Postgres as opposed to Datastore, you can create a new adapter here.

### PasswordAdapter

This adapter hashes and verifies passwords.

If you prefer something other than Bcrypt, you can create a new adapter here.

### RouterAdapter

This adapter captures the request and redirects it to the proper function to be handled.

If you would rather use another router, or need to use additional middleware, you can create a new adapter here.

## License

MIT
