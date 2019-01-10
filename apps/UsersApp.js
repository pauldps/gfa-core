'use strict'

const { ResourceApp } = require('./ResourceApp')

class UsersApp extends ResourceApp {
  constructor (options) {
    if (!options.session) {
      throw new Error('USERS_APP_SESSION_ADAPTER_REQUIRED')
    }
    super(options)
  }
}

exports.UsersApp = UsersApp
