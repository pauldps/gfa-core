'use strict'

const { SessionPolicy } = require('./SessionPolicy')

// This policy handles records owned by users.
class OwnerPolicy extends SessionPolicy {
  constructor (app) {
    super(app)
    this.isOwnerPolicy = true
  }

  create (req, res, callback) {
    if (this.disabled('create')) {
      this.notFound(req, res, callback)
      return
    }
    this.session(req, res, (err, user) => {
      if (err) {
        callback(err, req, res)
        return
      }
      if (!user) {
        this.unauthorized(req, res, callback)
        return
      }
      // Injects userId into data to be saved
      req.body[this.app.session.fields.association] = user.id
      super.create(req, res, callback)
    })
  }

  update (req, res, record, callback) {
    if (this.disabled('update')) {
      this.notFound(req, res, callback)
      return
    }
    this.session(req, res, (err, user) => {
      if (err) {
        callback(err, req, res)
        return
      }
      if (!user) {
        this.unauthorized(req, res, callback)
        return
      }
      // Admin or Owner can update record
      if (user[this.app.session.fields.role] === 'admin' || user.id === record[this.app.session.fields.association]) {
        super.update(req, res, record, callback)
        return
      }
      this.forbidden(req, res, null, callback)
    })
  }

  list (req, res, callback) {
    if (this.disabled('list')) {
      this.notFound(req, res, callback)
      return
    }
    this.session(req, res, (err, user) => {
      if (err) {
        callback(err, req, res)
        return
      }
      if (!user) {
        this.unauthorized(req, res, callback)
        return
      }
      // List will be filtered in the app itself
      super.list(req, res, callback)
    })
  }

  show (req, res, record, callback) {
    if (this.disabled('show')) {
      this.notFound(req, res, callback)
      return
    }
    this.session(req, res, (err, user) => {
      if (err) {
        callback(err, req, res)
        return
      }
      if (!user) {
        this.unauthorized(req, res, callback)
        return
      }
      // Admin or Owner can see record
      if (user[this.app.session.fields.role] === 'admin' || user.id === record[this.app.session.fields.association]) {
        super.show(req, res, record, callback)
        return
      }
      this.forbidden(req, res, null, callback)
    })
  }

  delete (req, res, record, callback) {
    if (this.disabled('delete')) {
      this.notFound(req, res, callback)
      return
    }
    this.session(req, res, (err, user) => {
      if (err) {
        callback(err, req, res)
        return
      }
      if (!user) {
        this.unauthorized(req, res, callback)
        return
      }
      // Admin or Owner can delete record
      if (user[this.app.session.fields.role] === 'admin' || user.id === record[this.app.session.fields.association]) {
        super.delete(req, res, record, callback)
        return
      }
      this.forbidden(req, res, null, callback)
    })
  }
}

exports.OwnerPolicy = OwnerPolicy
