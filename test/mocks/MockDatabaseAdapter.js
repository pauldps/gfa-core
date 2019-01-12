'use strict'

const { DatabaseAdapter } = require('../../adapters/DatabaseAdapter')
const { NotFoundError } = require('../../errors/NotFoundError')

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
    if (!conditions || conditions.length === 0) {
      callback(null, req, res, table)
      return
    }
    var condition
    for (record of table) {
      for (condition of conditions) {
        if (condition[0] === 'id') {
          condition[2] = parseInt(condition[2], 10)
        }
        if (condition[1] === '=') {
          if (record[condition[0]] === condition[2]) {
            results.push(Object.assign({}, record))
          }
        }
      }
    }
    callback(null, req, res, results)
  }

  insert (req, res, tableName, data, callback) {
    var table = this.getTable(tableName)
    var id = ++nextId
    var d = Object.assign({}, data)
    d.id = id
    table.push(d)
    callback(null, req, res, id)
  }

  replace (req, res, tableName, id, data, callback) {
    id = parseInt(id, 10)
    var table = this.getTable(tableName)
    var record
    for (record of table) {
      if (record.id === id) {
        Object.assign(record, data)
        callback(null, req, res)
        return
      }
    }
    callback(new NotFoundError(`${tableName}#${id} not found`), req, res)
  }

  delete (req, res, tableName, id, callback) {
    id = parseInt(id, 10)
    var table = this.getTable(tableName)
    if (!table) {
      callback(new NotFoundError(), req, res)
      return
    }
    for (var [index, record] of table.entries()) {
      if (record.id === id) {
        table.splice(index, 1)
        callback(null, req, res)
        return
      }
    }
    callback(new NotFoundError(), req, res)
  }

  getTable (tableName) {
    var table = this.tables.get(tableName)
    if (!table) {
      table = []
      this.tables.set(tableName, table)
    }
    return table
  }
}

exports.MockDatabaseAdapter = MockDatabaseAdapter
