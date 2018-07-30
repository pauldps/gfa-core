'use strict'

class DatabaseAdapter {
  /* istanbul ignore next */
  query (req, res, _tableName, _conditions, callback) {
    callback(new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED'), req, res, null)
  }

  /* istanbul ignore next */
  insert (req, res, _tableName, _data, callback) {
    callback(new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED'), req, res, null)
  }

  /* istanbul ignore next */
  replace (req, res, _tableName, _data, callback) {
    callback(new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED'), req, res, null)
  }

  /* istanbul ignore next */
  delete (req, res, _tableName, _id, callback) {
    callback(new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED'), req, res)
  }
}

exports.DatabaseAdapter = DatabaseAdapter
