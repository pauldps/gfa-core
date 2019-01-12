'use strict'

const { SessionPolicy } = require('./SessionPolicy')

// This policy handles user records.
class UserPolicy extends SessionPolicy {
  create (req, res, callback) {
    this.session(req, res, (err, data) => {
      if (err) {
        callback(err, req, res)
        return
      }
      // Nothing to do, but session needs to be loaded for sanitization to work.
      super.create(req, res, callback)
    })
  }

  update (req, res, record, callback) {
    this.session(req, res, (err, data) => {
      if (err) {
        callback(err, req, res)
        return
      }
      // Admin or Self can update record
      if (data && (data[this.app.session.fields.role] === 'admin' || data.id === record.id)) {
        super.update(req, res, record, callback)
        return
      }
      this.forbidden(req, res, null, callback)
    })
  }

  list (req, res, callback) {
    this.session(req, res, (err, data) => {
      if (err) {
        callback(err, req, res)
        return
      }
      if (!data) {
        this.unauthorized(req, res, callback)
        return
      }
      // Only Admins can list users.
      if (data && data[this.app.session.fields.role] === 'admin') {
        super.list(req, res, callback)
        return
      }
      this.forbidden(req, res, null, callback)
    })
  }

  show (req, res, record, callback) {
    this.session(req, res, (err, data) => {
      if (err) {
        callback(err, req, res)
        return
      }
      if (!data) {
        this.unauthorized(req, res, callback)
        return
      }
      // Admin or Self can see record
      if (data && (data[this.app.session.fields.role] === 'admin' || data.id === record.id)) {
        super.show(req, res, record, callback)
        return
      }
      this.forbidden(req, res, null, callback)
    })
  }

  delete (req, res, record, callback) {
    this.session(req, res, (err, data) => {
      if (err) {
        callback(err, req, res)
        return
      }
      // Admin or Self can delete record
      if (data && (data[this.app.session.fields.role] === 'admin' || data.id === record.id)) {
        super.delete(req, res, record, callback)
        return
      }
      this.forbidden(req, res, null, callback)
    })
  }
}

exports.UserPolicy = UserPolicy
