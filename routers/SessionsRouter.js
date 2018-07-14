'use strict'

const {BaseRouter} = require('./BaseRouter')

class SessionsRouter extends BaseRouter {
  constructor (options) {
    super(options)
    this.methods = new Map()
    this.final = notFound
  }

  handle (req, res) {
    this.normalize(req, res)
    var fn = this.methods.get(req.method)
    if (!fn) {
      return this.final(req, res)
    }
    fn(req, res)
  }

  build (proxy) {
    var methods = this.methods
    methods.set('POST', proxy.signIn)
    methods.set('GET', proxy.info)
    methods.set('HEAD', proxy.head)
    methods.set('DELETE', proxy.signOut)
    methods.set('OPTIONS', proxy.options)
    this.final = proxy.final || notFound
  }
}

function notFound (_req, res) {
  res.status(404).end()
}

exports.SessionsRouter = SessionsRouter
