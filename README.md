# @gfa/core

[![Build Status](https://travis-ci.com/pauloddr/gfa-core.svg?branch=master)](https://travis-ci.com/pauloddr/gfa-core)
[![Coverage Status](https://coveralls.io/repos/github/pauloddr/gfa-core/badge.svg?branch=master)](https://coveralls.io/github/pauloddr/gfa-core?branch=master)

This is the base project for the family of __@gfa/*__ components.

It provides a number of base classes for other packages to extend from.

## Apps

An "app" is the effective entry point of a Google Function.

An app is expected to have a `handle()` method that accepts `req` and `res` as arguments. Those are then passed onto the app's internal router.

All apps also have a `headers` property which is an array of headers that are sent in all responses (for things like CORS, security headers, and so on).

### `SessionsApp`

This is the base app for the authentication api (sign-in, sign-out, session information).

It serves the following endpoints (based on a Google Function named "session"):

* `POST /session`
* `GET /session`
* `DELETE /session`

### `UsersApp`

(Not yet implemented) This is an opinionated user management app with a simplistic role management.

It's an extension of `ResourceApp` with additional, user-management specific features.

### `ResourceApp`

(Not yet implemented) This app serves a RESTful-ish API for a single resource.

Example of endpoints served for a Google Function named "tasks":

* `POST /tasks` - create a new task
* `GET /tasks` - list tasks
* `GET /tasks/:id` - show info about an specific task
* `PUT /tasks/:id` - update a task (destructively)
* `PATCH /tasks/:id` - update a task (partially)
* `DELETE /tasks/:id` - delete a task

## Adapters

Each major functionality of an app (namely: session management, database storage, and password verification) relies on an adapter.

The following is the rough implementation of the [__@gfa/sessions-api__](https://github.com/pauloddr/gfa-session-api) project with opinionated adapters (ClientSessions, Google Datastore and Bcrypt):

```javascript
const ClientSessionsAdapter = require('@gfa/client-sessions-adapter')
const sessionAdapter = new ClientSessionsAdapter({
  secret: 'MYSECRET',
  // ... session settings go here
})

const GoogleDatastoreAdapter = require('@gfa/datastore-adapter')
const databaseAdapter = new GoogleDatastoreAdapter({
  // ... database settings go here
})

const BcryptAdapter = require('@gfa/bcrypt-adapter')
const passwordAdapter = new BcryptAdapter({
  // ... password settings go here
})

const ExpressSessionsRouter = require('@gfa/express-sessions-router')
const router = new ExpressSessionRouter({
  // ... router settings go here
})

const {SessionsApp} = require('@gfa/core/apps/SessionsApp')
const app = new SessionsApp({
  session: sessionAdapter,
  database: databaseAdapter,
  password: passwordAdapter,
  router: router
})

exports.handleRequest = function (req, res) {
  app.handle(req, res)
}
```

### `SessionAdapter`

This adapter handles client sessions and validates session credentials.

If you prefer JWT tokens instead of cookies, you can create a new adapter here.

### `DatabaseAdapter`

This adapter handles database operations, such as queries, insertions, updates, etc.

If you prefer MySQL or Postgres as opposed to Datastore, you can create a new adapter here.

### `PasswordAdapter`

This adapter hashes and verifies passwords.

If you prefer something other than Bcrypt, you can create a new adapter here.

## Routers

Each app has an specific router. The base routers provided by this package are not production-oriented, and it's highly recommended to use a real router (like express-session-router, for example).

Routers can be extended if additional middleware is required.

### `SessionsRouter`

This router handles the endpoints for a Session app.

### `UsersRouter`

This router handles the endpoints for an Users app.

### `ResourceRouter`

This router handles the endpoints for a resource app.

## License

MIT
