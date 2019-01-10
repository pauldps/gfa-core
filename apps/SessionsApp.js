'use strict'

const {BaseApp} = require('./BaseApp')

const INVALID_FORMAT = {code: 'INVALID_FORMAT'}

// This mini app serves the API endpoints for session management.
class SessionsApp extends BaseApp {
  constructor (opts) {
    var options = opts || {}
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
    var passwordField = this.fields.password
    var primaryValue = req.body[primaryField]
    var passwordValue = req.body[passwordField]
    if (typeof primaryValue !== 'string' || typeof passwordValue !== 'string') {
      return res.status(400).json(INVALID_FORMAT)
    }
    var conditions = [[primaryField, '=', primaryValue]]
    this
      .database
      .query(
        req, res,
        this.table, conditions,
        this.signInQueryResult
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
        this.signInPasswordResult
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
        this.signInSessionResult
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
    this.session.authorize(req, res, this.signOutAuthorized)
  }

  signOutAuthorized (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'signOutAuthorized')
    }
    this.session.destroy(req, res, this.signOutSessionDestroy)
  }

  signOutSessionDestroy (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'signOutSessionDestroy')
    }
    this.empty(null, req, res)
  }

  // GET /session
  info (req, res) {
    this.session.authorize(req, res, this.infoAuthorized)
  }

  infoAuthorized (err, req, res, sessionData) {
    if (err) {
      return this.error(err, req, res, 'infoAuthorized')
    }
    res.status(200).json(sessionData)
  }

  // HEAD /session
  head (req, res) {
    this.session.authorize(req, res, this.empty)
  }

  setFieldNames (opts) {
    this.fields = {}
    var options = opts || {}
    this.fields.primary = options.primary || 'username'
    this.fields.password = options.password || 'password'
  }

  bindMethods () {
    super.bindMethods()
    this.signIn = this.signIn.bind(this)
    this.signInQueryResult = this.signInQueryResult.bind(this)
    this.signInPasswordResult = this.signInPasswordResult.bind(this)
    this.signInSessionResult = this.signInSessionResult.bind(this)
    this.signOut = this.signOut.bind(this)
    this.signOutAuthorized = this.signOutAuthorized.bind(this)
    this.signOutSessionDestroy = this.signOutSessionDestroy.bind(this)
    this.info = this.info.bind(this)
    this.infoAuthorized = this.infoAuthorized.bind(this)
    this.head = this.head.bind(this)
  }
}

exports.SessionsApp = SessionsApp
