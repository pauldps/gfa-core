'use strict'

const NOT_IMPLEMENTED = new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED')

class DatabaseAdapter {
  /* istanbul ignore next */
  query (req, res, _table, _conditions, callback) {
    callback(NOT_IMPLEMENTED, req, res, null)
  }

  /* istanbul ignore next */
  delete (req, res, _kind, _id, callback) {
    callback(NOT_IMPLEMENTED, req, res)
  }
}

exports.DatabaseAdapter = DatabaseAdapter
