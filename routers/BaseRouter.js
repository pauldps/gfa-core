'use strict'

class BaseRouter {
  constructor () {
    this.app = null
    this.methods = new Map()
  }

  handle (req, res) {
    var fn = this.methods.get(req.method)
    if (fn) {
      fn(req, res)
    } else {
      this.app.final(req, res)
    }
  }
}

exports.BaseRouter = BaseRouter
