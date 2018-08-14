'use strict'

const {BasePolicy} = require('./BasePolicy')

class PublicPolicy extends BasePolicy {
  create (req, res, callback) {
    callback(null, req, res)
  }

  update (req, res, callback) {
    callback(null, req, res)
  }

  list (req, res, callback) {
    callback(null, req, res)
  }

  show (req, res, callback) {
    callback(null, req, res)
  }

  delete (req, res, callback) {
    callback(null, req, res)
  }

  record (req, res, recordInstance, callback) {
    callback(null, req, res)
  }
}

exports.PublicPolicy = PublicPolicy
