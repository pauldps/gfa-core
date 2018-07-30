'use strict'

const {SessionAdapter} = require('../../adapters/SessionAdapter')

// This mock can load two different sessions based on the
//   value of the Authorization header.
class MockSessionAdapter extends SessionAdapter {
  constructor (options) {
    super(options)
    this.tables = null
    this.app = null
  }

  load (req, res, callback) {
    var [user, secret] = (req.header('authorization') || '').split('|')
    if (secret !== this.secret) {
      return callback(null, req, res)
    }
    this.app.database.query(req, res, this.app.table, [[this.app.fields.primary, '=', user]], (_err, req, res, results) => {
      var record = results[0]
      var session = {}
      var field
      for (field of this.expose) {
        session[field] = record[field]
      }
      res.locals.session = session
      callback(null, req, res)
    })
  }

  create (req, res, userRecord, callback) {
    var username = userRecord[this.app.fields.primary]
    res.header('x-token', `${username}|${this.secret}`)
    this.app.database.query(req, res, this.app.table, [[this.app.fields.primary, '=', username]], (_err, req, res, results) => {
      var record = results[0]
      var session = {}
      var field
      for (field of this.expose) {
        session[field] = record[field]
      }
      res.locals.session = session
      callback(null, req, res)
    })
    callback(null, req, res)
  }

  destroy (req, res, callback) {
    // nothing to do
    callback(null, req, res)
  }
}

exports.MockSessionAdapter = MockSessionAdapter
