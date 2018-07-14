'use strict'

const {BaseApp} = require('./BaseApp')

// This mini app serves the API endpoints for session management.
class SessionsApp extends BaseApp {
  constructor (options) {
    super(options)
    if (!options.session) {
      throw new Error('APP_SESSION_ADAPTER_REQUIRED')
    }
    if (!options.database) {
      throw new Error('APP_DATABASE_ADAPTER_REQUIRED')
    }
    if (!options.password) {
      throw new Error('APP_PASSWORD_ADAPTER_REQUIRED')
    }
    this.session = options.session
    this.database = options.database
    this.password = options.password
    this.table = options.table || 'users'
    this.setFieldNames(options.fields)
    this.build()
  }

  // POST /session
  signIn (req, res) {
    var primaryField = this.fields.primary
    var conditions = [[primaryField, '=', req.body[primaryField]]]
    this
      .database
      .query(
        req, res,
        this.table, conditions,
        this.proxy.signInQueryResult
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
        req, res,
        user[passwordField], req.body[passwordField],
        this.proxy.signInPasswordResult
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
        req, res,
        res.locals.signInUser,
        this.proxy.signInSessionResult
      )
  }

  signInSessionResult (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'signInSessionResult')
    }
    res.status(201).json(this.session.data(req, res))
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
    this.empty(null, req, res)
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

  setFieldNames (opts) {
    this.fields = {}
    var options = opts || {}
    this.fields.primary = options.primary || 'username'
    this.fields.password = options.password || 'password'
  }

  proxify () {
    super.proxify()
    this.proxy.signIn = this.signIn.bind(this)
    this.proxy.signInQueryResult = this.signInQueryResult.bind(this)
    this.proxy.signInPasswordResult = this.signInPasswordResult.bind(this)
    this.proxy.signInSessionResult = this.signInSessionResult.bind(this)
    this.proxy.signOut = this.signOut.bind(this)
    this.proxy.signOutAuthorized = this.signOutAuthorized.bind(this)
    this.proxy.signOutSessionDestroy = this.signOutSessionDestroy.bind(this)
    this.proxy.info = this.info.bind(this)
    this.proxy.infoAuthorized = this.infoAuthorized.bind(this)
    this.proxy.head = this.head.bind(this)
  }
}

exports.SessionsApp = SessionsApp
