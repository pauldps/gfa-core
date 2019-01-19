'use strict'

const { BasePolicy } = require('./BasePolicy')

class PublicPolicy extends BasePolicy {
  create (req, res, callback) {
    if (this.disabled('create')) {
      this.notFound(req, res, callback)
      return
    }
    callback(null, req, res)
  }

  update (req, res, record, callback) {
    if (this.disabled('update')) {
      this.notFound(req, res, callback)
      return
    }
    callback(null, req, res)
  }

  list (req, res, callback) {
    if (this.disabled('list')) {
      this.notFound(req, res, callback)
      return
    }
    callback(null, req, res)
  }

  show (req, res, record, callback) {
    if (this.disabled('show')) {
      this.notFound(req, res, callback)
      return
    }
    callback(null, req, res)
  }

  delete (req, res, record, callback) {
    if (this.disabled('delete')) {
      this.notFound(req, res, callback)
      return
    }
    callback(null, req, res)
  }
}

exports.PublicPolicy = PublicPolicy
