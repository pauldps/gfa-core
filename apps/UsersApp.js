'use strict'

const { ResourceApp } = require('./ResourceApp')

class UsersApp extends ResourceApp {
  constructor (opts) {
    var options = opts || {}
    if (!options.session) {
      throw new Error('USERS_APP_SESSION_ADAPTER_REQUIRED')
    }
    if (!options.password) {
      throw new Error('USERS_APP_PASSWORD_ADAPTER_REQUIRED')
    }
    super(options)
    this.password = options.password
  }

  parseRecord (record, req, res) {
    var s = this.session
    var fields = s.fields
    delete record[fields.password]
    var session = s.data(req, res)
    if (session) {
      if (session.id !== record.id && session[fields.role] !== 'admin') {
        delete record[fields.email]
      }
    }
    return record
  }
}

exports.UsersApp = UsersApp
