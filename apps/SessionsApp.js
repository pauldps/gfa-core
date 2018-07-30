'use strict'

const {BaseApp} = require('./BaseApp')
const {PayloadError} = require('../lib/PayloadError')

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
  }

  // POST /session
  signIn (payload) {
    var app = payload.app
    return app
      .validate(payload)
      .then(app.findUser)
      .then(app.validatePassword)
      .then(app.session.create)
      .then(app.sessionInfo)
  }

  validate (payload) {
    var {app, req} = payload
    var primaryField = app.fields.primary
    var passwordField = app.fields.password
    var primaryValue = req.body[primaryField]
    var passwordValue = req.body[passwordField]
    if (typeof primaryValue !== 'string' || typeof passwordValue !== 'string') {
      payload.status = 400
      return Promise.reject(new PayloadError('INVALID_FORMAT', payload, 'SessionsApp#validate'))
    }
    return Promise.resolve(payload)
  }

  findUser (payload) {
    var {app, req} = payload
    var primaryField = app.fields.primary
    var primaryValue = req.body[primaryField]
    payload.metadata.queryConditions = [[primaryField, '=', primaryValue]]
    return app.database.query(payload).then(app.findUserResult)
  }

  findUserResult (payload) {
    var results = payload.metadata.queryResults
    if (!results || results.length === 0) {
      payload.status = 401
      return Promise.reject(new PayloadError('INVALID_CREDENTIALS', payload, 'SessionsApp#findUserResult'))
    }
    payload.metadata.databaseUser = results[0]
    return payload
  }

  validatePassword (payload) {
    var app = payload.app
    var passwordField = app.fields.password
    var metadata = payload.metadata
    metadata.password = payload.req.body[passwordField]
    metadata.passwordHash = metadata.databaseUser[passwordField]
    return app.password.validate(payload).then(app.signInPasswordResult)
  }

  signInPasswordResult (payload) {
    var valid = payload.metadata.validPassword
    if (!valid) {
      payload.status = 401
      return Promise.reject(new PayloadError('INVALID_CREDENTIALS', payload, 'SessionsApp#signInPasswordResult'))
    }
    payload.status = 201
    return payload
  }

  // DELETE /session
  signOut (payload) {
    var app = payload.app
    return app
      .session
      .authorize(payload)
      .then(app.session.destroy)
      .then(app.empty)
  }

  // GET /session
  info (payload) {
    var app = payload.app
    return app.session.authorize(payload).then(app.sessionInfo)
  }

  sessionInfo (payload) {
    payload.res.json(payload.app.session.data(payload))
  }

  // HEAD /session
  head (payload) {
    var app = payload.app
    return app.session.authorize(payload).then(app.empty)
  }

  setFieldNames (opts) {
    this.fields = {}
    var options = opts || {}
    this.fields.primary = options.primary || 'username'
    this.fields.password = options.password || 'password'
  }
}

exports.SessionsApp = SessionsApp
