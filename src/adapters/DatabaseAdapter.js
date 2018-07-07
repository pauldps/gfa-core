'use strict'

const NOT_IMPLEMENTED = new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED')

class DatabaseAdapter {
  query (req, res, _table, _conditions, callback) {
    callback(NOT_IMPLEMENTED, req, res, null)
  }
}

exports.DatabaseAdapter = DatabaseAdapter
