'use strict'

const { ResourceApp } = require('./ResourceApp')
const { UserPolicy } = require('../policies/UserPolicy')

class UsersApp extends ResourceApp {
  constructor (opts) {
    var options = opts || {}
    if (!options.session) {
      throw new Error('USERS_APP_SESSION_ADAPTER_REQUIRED')
    }
    if (!options.password) {
      throw new Error('USERS_APP_PASSWORD_ADAPTER_REQUIRED')
    }
    options.table = options.table || 'Users'
    super(options)
    this.policy = options.policy || new UserPolicy(this)
    this.password = options.password
  }

  parseRecord (record, req, res) {
    var s = this.session
    var fields = s.fields
    delete record[fields.password]
    var session = s.data(req, res)
    if (!session || (session.id !== record.id && session[fields.role] !== 'admin')) {
      delete record[fields.email]
    }
    return record
  }

  sanitize (req, res) {
    // Session data loaded in UserPolicy#create().
    var session = this.session.data(req, res)
    if (!session || session[this.session.fields.role] !== 'admin') {
      delete req.body[this.session.fields.role]
    }
  }

  createValidated (err, req, res) {
    if (err) {
      this.error(err, req, res, 'createValidated')
      return
    }
    this.timestamp(req.body)
    this.password.generate(req, res, req.body[this.session.fields.password], this.createPassword)
  }

  createPassword (err, req, res, passwordHash) {
    if (err) {
      this.error(err, req, res, 'createPassword')
      return
    }
    req.body[this.session.fields.password] = passwordHash
    this.database.insert(req, res, this.table, req.body, this.createSaved)
  }

  bindMethods () {
    super.bindMethods()
    this.createPassword = this.createPassword.bind(this)
  }
}

exports.UsersApp = UsersApp
