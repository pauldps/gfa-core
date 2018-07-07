'use strict'

const {SessionAdapter} = require('../../src/adapters/SessionAdapter')

// This mock can load two different sessions based on the
//   value of the Authorization header.
class MockSessionAdapter extends SessionAdapter {
  load (req, res, callback) {
    if (req.header('authorization') === `abctoken${this.secret}`) {
      res.locals.session = {id: 1, username: 'abc'}
    } else if (req.header('authorization') === `deftoken${this.secret}`) {
      res.locals.session = {id: 2, username: 'def'}
    }
    callback(null, req, res)
  }

  create (req, res, userRecord, callback) {
    res.header('x-token', `${userRecord.username}token${this.secret}`)
    if (userRecord.username === 'abc') {
      res.locals.session = {id: 1, username: 'abc'}
    } else if (userRecord.username === 'def') {
      res.locals.session = {id: 2, username: 'def'}
    }
    callback(null, req, res)
  }

  destroy (req, res, callback) {
    // nothing to do
    callback(null, req, res)
  }
}

exports.MockSessionAdapter = MockSessionAdapter
