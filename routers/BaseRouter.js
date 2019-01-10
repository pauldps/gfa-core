'use strict'

class BaseRouter {
  constructor () {
    this.app = null
    this.methods = new Map()
    this.bindMethods()
  }

  handle (req, res) {
    var fn = this.methods.get(req.method)
    if (fn) {
      fn(req, res)
    } else {
      this.app.final(req, res)
    }
  }

  bindMethods () {
    this.handle = this.handle.bind(this)
  }
}

exports.BaseRouter = BaseRouter
