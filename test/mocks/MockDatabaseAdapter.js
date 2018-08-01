'use strict'

const {DatabaseAdapter} = require('../../adapters/DatabaseAdapter')
const {NotFoundError} = require('../../errors/NotFoundError')

var nextId = 0

// Memory-based Database Adapter for testing purposes.
class MockDatabaseAdapter extends DatabaseAdapter {
  constructor (options) {
    super(options)
    this.tables = new Map()
  }

  query (req, res, tableName, conditions, callback) {
    var table = this.getTable(tableName)
    var results = []
    var record
    var condition
    for (record of table) {
      for (condition of conditions) {
        if (condition[1] === '=') {
          if (record[condition[0]] === condition[2]) {
            results.push(Object.assign({}, record))
          }
        }
      }
    }
    return callback(null, req, res, results)
  }

  insert (req, res, tableName, data, callback) {
    var table = this.getTable(tableName)
    var id = ++nextId
    var d = Object.assign({}, data)
    d.id = id
    table.push(d)
    callback(null, req, res, id)
  }

  replace (req, res, tableName, data, callback) {
    var table = this.getTable(tableName)
    var id = data.id
    var record
    for (record of table) {
      if (record.id === id) {
        Object.assign(record, data)
        return callback(null, req, res, id)
      }
    }
    callback(new NotFoundError(`${tableName}#${data.id} not found`), req, res, null)
  }

  getTable (tableName) {
    var table = this.tables.get(tableName)
    if (!table) {
      table = []
      this.tables.set(tableName, table)
    }
    return table
  }

  clearTable (tableName) {
    var table = this.tables.get(tableName)
    table.length = 0
  }
}

exports.MockDatabaseAdapter = MockDatabaseAdapter
