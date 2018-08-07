'use strict'

class DatabaseAdapter {
  constructor () {
    // If true, insert() method will use data.id to assign
    //   the record's id instead of relying on auto generation.
    this.customId = false
  }

  /* istanbul ignore next */
  query (req, res, _tableName, _conditions, callback) {
    callback(new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED'), req, res, null)
  }

  /* istanbul ignore next */
  insert (req, res, _tableName, _data, callback) {
    callback(new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED'), req, res, null)
  }

  /* istanbul ignore next */
  replace (req, res, _tableName, _id, _data, callback) {
    callback(new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED'), req, res)
  }

  /* istanbul ignore next */
  delete (req, res, _tableName, _id, callback) {
    callback(new Error('DATABASE_ADAPTER_NOT_IMPLEMENTED'), req, res)
  }
}

exports.DatabaseAdapter = DatabaseAdapter
