'use strict'

const CONFIGURATION_ERROR = new Error('CONFIGURATION_ERROR')
const INTERNAL_ERROR_RESPONSE = {code: 'INTERNAL_ERROR'}

// This mini app serves the API endpoints for session management.
class App {
  constructor (options) {
    if (!options) {
      throw new Error('AUTHORIZER_OPTIONS_REQUIRED')
    }
    if (!options.session) {
      throw new Error('AUTHORIZER_SESSION_ADAPTER_REQUIRED')
    }
    if (!options.router) {
      throw new Error('AUTHORIZER_ROUTER_ADAPTER_REQUIRED')
    }
    this.session = options.session
    this.database = options.database
    this.password = options.password
    this.router = options.router
    this.headers = []
    this.table = options.table || 'User'
    this.setFieldNames(options.fields)
    this.proxify()
    this.router.build(this.proxy)
  }

  handle (req, res) {
    if (!this.router) {
      return this.error(CONFIGURATION_ERROR, req, res, 'handle')
    }
    this.setHeaders(req, res)
    this.router.handle(req, res)
  }

  // POST /session
  signIn (req, res) {
    if (!this.database || !this.password) {
      return this.error(CONFIGURATION_ERROR, req, res)
    }
    var primaryField = this.fields.primary
    var conditions = [[primaryField, '=', req.body[primaryField]]]
    this
      .database
      .query(
        this.table, conditions,
        this.proxy.signInQueryResult,
        req, res
      )
  }

  signInQueryResult (err, req, res, results) {
    if (err) {
      return this.error(err, req, res, 'signInQueryResult')
    }
    if (!results || results.length === 0) {
      return res.status(401).end()
    }
    var user = results[0]
    res.locals.signInUser = user
    var passwordField = this.fields.password
    this
      .password
      .validate(
        user[passwordField], req.body[passwordField],
        this.proxy.signInPasswordResult,
        req, res
      )
  }

  signInPasswordResult (err, req, res, valid) {
    if (err) {
      return this.error(err, req, res, 'signInPasswordResult')
    }
    if (!valid) {
      return res.status(401).end()
    }
    this
      .session
      .create(
        res.locals.signInUser,
        this.proxy.signInSessionResult,
        req, res
      )
  }

  signInSessionResult (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'signInSessionResult')
    }
    res.status(201).json(this.session.data(res))
  }

  // DELETE /session
  signOut (req, res) {
    this.session.authorize(req, res, this.proxy.signOutAuthorized)
  }

  signOutAuthorized (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'signOutAuthorized')
    }
    this.session.destroy(req, res, this.proxy.signOutSessionDestroy)
  }

  signOutSessionDestroy (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'signOutSessionDestroy')
    }
    this.empty(req, res)
  }

  // GET /session
  info (req, res) {
    this.session.authorize(req, res, this.proxy.infoAuthorized)
  }

  infoAuthorized (err, req, res, sessionData) {
    if (err) {
      return this.error(err, req, res, 'infoAuthorized')
    }
    res.status(200).json(sessionData)
  }

  // HEAD /session
  head (req, res) {
    this.session.authorize(req, res, this.proxy.empty)
  }

  // OPTIONS /session
  options (req, res) {
    this.empty(null, req, res)
  }

  empty (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'empty')
    }
    res.status(204).end()
  }

  error (err, req, res, source) {
    console.error(source, err)
    res.status(500).json(INTERNAL_ERROR_RESPONSE)
  }

  final (req, res) {
    if (!res.headerSent) {
      res.status(404).end()
    }
  }

  setHeaders (req, res) {
    var header
    for (header of this.headers) {
      res.header(header[0], header[1])
    }
  }

  setFieldNames (opts) {
    this.fields = {}
    var options = opts || {}
    this.fields.primary = options.primary || 'username'
    this.fields.password = options.password || 'password'
  }

  // Create a "proxy" object with function copies bound to this instance.
  // Used by routing and callbacks for improved performance.
  proxify () {
    this.proxy = {
      setHeaders: this.setHeaders.bind(this),
      signIn: this.signIn.bind(this),
      signInQueryResult: this.signInQueryResult.bind(this),
      signInPasswordResult: this.signInPasswordResult.bind(this),
      signInSessionResult: this.signInSessionResult.bind(this),
      signOut: this.signOut.bind(this),
      signOutAuthorized: this.signOutAuthorized.bind(this),
      signOutSessionDestroy: this.signOutSessionDestroy.bind(this),
      info: this.info.bind(this),
      infoAuthorized: this.infoAuthorized.bind(this),
      head: this.head.bind(this),
      options: this.options.bind(this),
      empty: this.empty.bind(this),
      error: this.error.bind(this),
      final: this.final.bind(this)
    }
  }
}

exports.App = App
