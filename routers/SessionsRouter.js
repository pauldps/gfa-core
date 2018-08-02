'use strict'

const {BaseRouter} = require('./BaseRouter')

class SessionsRouter extends BaseRouter {
  build (app) {
    this.app = app
    var proxy = this.app.proxy
    var methods = this.methods
    methods.set('POST', proxy.signIn)
    methods.set('GET', proxy.info)
    methods.set('HEAD', proxy.head)
    methods.set('DELETE', proxy.signOut)
    methods.set('OPTIONS', proxy.options)
  }
}

exports.SessionsRouter = SessionsRouter
