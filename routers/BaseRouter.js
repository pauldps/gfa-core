'use strict'

class BaseRouter {
  constructor (opts) {
    var options = opts || {}
    this.firebasePath = options.firebasePath
  }

  normalize (req, res) {
    if (req.params['0']) {
      if (this.firebasePath && req.params['0'].startsWith(this.firebasePath)) {
        req.params['0'] = req.params['0'].replace(this.firebasePath, '')
      }
      if (req.params['0'] === '/') {
        req.params['0'] = ''
      }
    }
  }
}

exports.BaseRouter = BaseRouter
