'use strict'

const { PublicPolicy } = require('./PublicPolicy')

// This policy handles user records.
class UserPolicy extends PublicPolicy {
  update (req, res, record, callback) {
    var session = this.app.session.data()
    if (!session) {
      this.unauthorized(req, res, callback)
      return
    }
    // Admin or Self can update record
    if (session[this.app.session.fields.role] === 'admin' || session.id === record.id) {
      super.update(req, res, record, callback)
      return
    }
    this.forbidden(req, res, 'FORBIDDEN', callback)
  }

  list (req, res, callback) {
    callback(null, req, res)
  }

  show (req, res, record, callback) {
    callback(null, req, res)
  }

  delete (req, res, record, callback) {
    callback(null, req, res)
  }
}

exports.UserPolicy = UserPolicy
