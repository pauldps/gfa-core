'use strict'

const { BaseRouter } = require('./BaseRouter')

class ResourceRouter extends BaseRouter {
  build (app) {
    this.app = app
    var methods = this.methods
    methods.set('POST', app.create)
    methods.set('PUT', this.replace)
    methods.set('PATCH', this.update)
    methods.set('GET', this.listOrShow)
    methods.set('DELETE', this.delete)
    methods.set('OPTIONS', app.options)
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

  bindMethods () {
    this.replace = this.replace.bind(this)
    this.update = this.update.bind(this)
    this.listOrShow = this.listOrShow.bind(this)
    this.delete = this.delete.bind(this)
  }
}

exports.ResourceRouter = ResourceRouter
