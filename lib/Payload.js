'use strict'

// A Payload instance is created per request
//   to be passed along Promise chains.
class Payload {
  constructor (req, res, app) {
    this._req = req
    this._res = res
    this._app = app
    this._metadata = null
  }

  // Request processing starts here.
  process () {
    var app = this.app
    return app.router.handle(this)
  }

  get req () {
    if (!this._req) {
      throw new Error('PAYLOAD_REQ_MISSING')
    }
    return this._req
  }

  get res () {
    if (!this._res) {
      throw new Error('PAYLOAD_RES_MISSING')
    }
    return this._res
  }

  get app () {
    if (!this._app) {
      throw new Error('PAYLOAD_APP_MISSING')
    }
    return this._app
  }

  get metadata () {
    if (!this._metadata) {
      this._metadata = {}
    }
    return this._metadata
  }

  set status (code) {
    this.res.status(code)
  }

  notFound () {
    this.status = 404
    this.res.end()
  }

  free () {
    this._req = null
    this._res = null
    this._app = null
    this._metadata = null
  }
}

exports.Payload = Payload
