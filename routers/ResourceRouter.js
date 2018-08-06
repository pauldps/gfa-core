'use strict'

const {BaseRouter} = require('./BaseRouter')

class ResourceRouter extends BaseRouter {
  build (app) {
    this.app = app
    var proxy = this.app.proxy
    var methods = this.methods
    methods.set('POST', proxy.create)
    methods.set('PUT', this.replace.bind(this))
    methods.set('PATCH', this.update.bind(this))
    methods.set('GET', this.listOrShow.bind(this))
    methods.set('DELETE', this.delete.bind(this))
    methods.set('OPTIONS', proxy.options)
  }

  replace (req, res) {
    this.app.setResourceId(req, res)
    if (res.locals.resourceId) {
      this.app.replace(req, res)
    } else {
      this.app.final(req, res)
    }
  }

  update (req, res) {
    this.app.setResourceId(req, res)
    if (res.locals.resourceId) {
      this.app.update(req, res)
    } else {
      this.app.final(req, res)
    }
  }

  listOrShow (req, res) {
    this.app.setResourceId(req, res)
    if (res.locals.resourceId) {
      this.app.show(req, res)
    } else {
      this.app.list(req, res)
    }
  }

  delete (req, res) {
    this.app.setResourceId(req, res)
    if (res.locals.resourceId) {
      this.app.delete(req, res)
    } else {
      this.app.final(req, res)
    }
  }
}

exports.ResourceRouter = ResourceRouter
