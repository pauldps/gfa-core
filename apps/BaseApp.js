'use strict'

const {Payload} = require('../lib/Payload')

const INTERNAL_ERROR_RESPONSE = {code: 'INTERNAL_ERROR'}

class BaseApp {
  constructor (options) {
    if (!options) {
      throw new Error('APP_OPTIONS_REQUIRED')
    }
    if (!options.router) {
      throw new Error('APP_ROUTER_REQUIRED')
    }
    this.router = options.router
    this.router.app = this
    this.headers = options.headers || []
    this.firebasePath = options.firebasePath
  }

  handle (req, res) {
    var payload = new Payload(req, res, this)
    return payload.process().catch(err => {
      err.payload = payload
      this.error(err)
    })
  }

  // OPTIONS /endpoint
  options (payload) {
    payload.app.empty(payload)
  }

  empty (payload) {
    payload.res.status(204).end()
  }

  error (err /* err with payload */) {
    var res = err.payload.res
    if (err.message === 'UNAUTHORIZED') {
      return res.status(401).end()
    }
    // Uncaught errors should be logged, but not exposed.
    console.error(err.source, err)
    res.status(500).json(INTERNAL_ERROR_RESPONSE)
  }

  setHeaders (payload) {
    var header
    var headers = payload.app.headers
    var res = payload.res
    for (header of headers) {
      res.header(header[0], header[1])
    }
  }

  // The last method called during a request.
  final (payload) {
    var res = payload.res
    if (!res.headerSent) {
      res.status(404).end()
    }
    payload.free()
  }
}

exports.BaseApp = BaseApp
