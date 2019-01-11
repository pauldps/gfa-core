'use strict'

const { BaseRouter } = require('./BaseRouter')

class SessionsRouter extends BaseRouter {
  build (app) {
    this.app = app
    var methods = this.methods
    methods.set('POST', app.signIn)
    methods.set('GET', app.info)
    methods.set('HEAD', app.head)
    methods.set('DELETE', app.signOut)
    methods.set('OPTIONS', app.options)
  }
}

exports.SessionsRouter = SessionsRouter
