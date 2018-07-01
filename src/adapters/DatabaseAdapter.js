'use strict'

const NOT_IMPLEMENTED = new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED')

class DatabaseAdapter {
  query (_table, _conditions, callback, req, res) {
    callback(NOT_IMPLEMENTED, req, res, null)
  }
}

exports.DatabaseAdapter = DatabaseAdapter
