'use strict'

const {ForbiddenError} = require('../errors/ForbiddenError')

class BasePolicy {
  constructor (app) {
    this.app = app
  }

  create (req, res, callback) {
    callback(new ForbiddenError('POLICY_NOT_IMPLEMENTED'), req, res)
  }

  update (req, res, callback) {
    callback(new ForbiddenError('POLICY_NOT_IMPLEMENTED'), req, res)
  }

  list (req, res, callback) {
    callback(new ForbiddenError('POLICY_NOT_IMPLEMENTED'), req, res)
  }

  show (req, res, callback) {
    callback(new ForbiddenError('POLICY_NOT_IMPLEMENTED'), req, res)
  }

  delete (req, res, callback) {
    callback(new ForbiddenError('POLICY_NOT_IMPLEMENTED'), req, res)
  }
}

exports.BasePolicy = BasePolicy
