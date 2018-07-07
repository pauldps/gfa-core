'use strict'

const {DatabaseAdapter} = require('../../src/adapters/DatabaseAdapter')

class MockDatabaseAdapter extends DatabaseAdapter {
  query (req, res, table, conditions, callback) {
    if (table !== 'users') {
      return callback(null, req, res, [])
    }
    if (!conditions || !conditions[0]) {
      return callback(null, req, res, [])
    }
    if (conditions[0][0] !== 'username' && conditions[0][1] !== '=') {
      return callback(null, req, res, [])
    }
    var username = conditions[0][2]
    if (username === 'abc') {
      return callback(null, req, res, [{id: 1, username: 'abc', password: '123'}])
    }
    if (username === 'def') {
      return callback(null, req, res, [{id: 2, username: 'def', password: '456'}])
    }
    return callback(null, req, res, [])
  }
}

exports.MockDatabaseAdapter = MockDatabaseAdapter
