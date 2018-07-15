'use strict'

const {BaseRouter} = require('./BaseRouter')

class ResourceRouter extends BaseRouter {
  constructor (options) {
    super(options)
    this.methods = new Map()
    this.final = notFound
    this.app = null
  }

  handle (req, res) {
    this.normalize(req, res)
    var fn = this.methods.get(req.method)
    if (fn) {
      return fn(req, res)
    }
    this.final(req, res)
  }

  build (proxy) {
    this.app = proxy
    var methods = this.methods
    methods.set('POST', proxy.create)
    methods.set('PUT', proxy.replace)
    methods.set('PATCH', proxy.update)
    methods.set('GET', this.listOrShow)
    methods.set('DELETE', proxy.delete)
    methods.set('OPTIONS', proxy.options)
    this.final = proxy.final || notFound
  }

  listOrShow (req, res) {
    if (req.params['0'] !== '') {
      res.locals.resourceId = req.params['0'].replace('/', '')
      return this.app.show(req, res)
    }
    this.app.list(req, res)
  }
}

function notFound (_req, res) {
  res.status(404).end()
}

exports.ResourceRouter = ResourceRouter
