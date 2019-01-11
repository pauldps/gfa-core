'use strict'

const { ForbiddenError } = require('../errors/ForbiddenError')
const { UnauthorizedError } = require('../errors/UnauthorizedError')

class BasePolicy {
  constructor (app) {
    this.app = app
  }

  create (req, res, callback) {
    this.forbidden(req, res, 'POLICY_NOT_IMPLEMENTED', callback)
  }

  update (req, res, record, callback) {
    this.forbidden(req, res, 'POLICY_NOT_IMPLEMENTED', callback)
  }

  list (req, res, callback) {
    this.forbidden(req, res, 'POLICY_NOT_IMPLEMENTED', callback)
  }

  show (req, res, record, callback) {
    this.forbidden(req, res, 'POLICY_NOT_IMPLEMENTED', callback)
  }

  delete (req, res, record, callback) {
    this.forbidden(req, res, 'POLICY_NOT_IMPLEMENTED', callback)
  }

  forbidden (req, res, message, callback) {
    callback(new ForbiddenError(message), req, res)
  }

  unauthorized (req, res, callback) {
    callback(new UnauthorizedError(), req, res)
  }
}

exports.BasePolicy = BasePolicy
