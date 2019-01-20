'use strict'

const { BaseApp } = require('./BaseApp')
const { PublicPolicy } = require('../policies/PublicPolicy')
const { OwnerPolicy } = require('../policies/OwnerPolicy')
const { NotFoundError } = require('../errors/NotFoundError')
const { ConflictError } = require('../errors/ConflictError')

const NOT_FOUND = new NotFoundError()

class ResourceApp extends BaseApp {
  constructor (options) {
    super(options)
    if (!options.database) {
      throw new Error('RESOURCE_APP_DATABASE_ADAPTER_REQUIRED')
    }
    if (!options.table) {
      throw new Error('RESOURCE_APP_TABLE_REQUIRED')
    }
    this.database = options.database
    this.session = options.session
    this.table = options.table
    this.policy = options.policy || (this.session ? new OwnerPolicy(this) : new PublicPolicy(this))
    this.timestamps = options.timestamps || { enabled: false }
    if (this.timestamps.created || this.timestamps.updated) {
      this.timestamps.enabled = true
    }
    this.unique = [] // field names that should be used in unique queries
    this.updateOnConflict = false // if unique constraint fails on creation, update found record instead
    this.build()
  }

  handle (req, res) {
    this.setHeaders(req, res)
    if (this.session) {
      this.session.load(req, res, this.handleSession)
    } else {
      this.router.handle(req, res)
    }
  }

  handleSession (err, req, res) {
    if (err) {
      this.error(err, req, res)
      return
    }
    this.router.handle(req, res)
  }

  sanitize (req, res) {
    // Does nothing by default.
    // Should be overwritten in a subclass.
  }

  validate (req, res, callback) {
    // Does nothing by default.
    // Should be overwritten in a subclass.
    callback(null, req, res)
  }

  parseRecord (record, req, res) {
    // Does nothing by default.
    // Should be overwritten in a subclass.
    return record
  }

  parseList (recordList, req, res) {
    var record
    for (record of recordList) {
      this.parseRecord(record, req, res)
    }
    return recordList
  }

  // Timestamps a record (on create or update).
  timestamp (record) {
    if (this.timestamps.enabled === false) {
      return record
    }
    var now = new Date()
    var created = this.timestamps.created
    if (created && !record[created]) {
      record[created] = now
    }
    var updated = this.timestamps.updated
    if (updated) {
      record[updated] = now
    }
    return record
  }

  // POST /resources
  create (req, res) {
    this.policy.create(req, res, this.createAllowed)
  }

  createAllowed (err, req, res) {
    if (err) {
      this.error(err, req, res, 'createAllowed')
      return
    }
    this.sanitize(req, res)
    delete req.body.id
    this.validate(req, res, this.createValidated)
  }

  createValidated (err, req, res) {
    if (err) {
      this.error(err, req, res, 'createValidated')
      return
    }
    this.timestamp(req.body)
    if (!this.unique || this.unique.length === 0) {
      this.database.insert(req, res, this.table, req.body, this.createSaved)
      return
    }
    // Look for conflicting records
    var conditions = []
    for (var field of this.unique) {
      conditions.push([field, '=', req.body[field]])
    }
    this.database.query(req, res, this.table, conditions, this.createConstraint)
  }

  createSaved (err, req, res, id) {
    if (err) {
      this.error(err, req, res, 'createSaved')
      return
    }
    req.body.id = id
    res.status(201).json(this.parseRecord(req.body, req, res))
  }

  createConstraint (err, req, res, results) {
    if (err) {
      this.error(err, req, res, 'createConstraint')
      return
    }
    var record = results[0]
    if (!record) { // No conflict
      this.database.insert(req, res, this.table, req.body, this.createSaved)
      return
    }
    if (this.updateOnConflict) {
      req.partialUpdate = true
      res.locals.record = record
      res.locals.resourceId = record.id
      this.replaceAllowed(null, req, res)
      return
    }
    this.error(new ConflictError(), req, res, 'createConstraint')
  }

  // PUT /resources
  replace (req, res) {
    this.database.query(req, res, this.table, [['id', '=', res.locals.resourceId]], this.replaceFound)
  }

  replaceFound (err, req, res, results) {
    if (err) {
      this.error(err, req, res, 'replaceFound')
      return
    }
    var record = results[0]
    if (!record) {
      this.error(NOT_FOUND, req, res, 'replaceFound')
      return
    }
    res.locals.record = record
    this.policy.update(req, res, record, this.replaceAllowed)
  }

  replaceAllowed (err, req, res) {
    if (err) {
      this.error(err, req, res, 'replaceAllowed')
      return
    }
    var record = res.locals.record
    if (req.partialUpdate) {
      Object.assign(record, req.body)
      req.body = record
      delete req.body.id
    } else {
      // Protected properties
      var created = this.timestamps.created
      if (created) {
        req.body[created] = record[created]
      }
    }
    this.sanitize(req, res)
    this.validate(req, res, this.replaceValidated)
  }

  replaceValidated (err, req, res) {
    if (err) {
      this.error(err, req, res, 'replaceValidated')
      return
    }
    this.timestamp(req.body)
    this.database.replace(req, res, this.table, res.locals.resourceId, req.body, this.replaceSaved)
  }

  replaceSaved (err, req, res) {
    if (err) {
      this.error(err, req, res, 'replaceSaved')
      return
    }
    req.body.id = res.locals.resourceId
    res.status(200).json(this.parseRecord(req.body, req, res))
  }

  // PATCH /resources
  update (req, res) {
    req.partialUpdate = true
    this.replace(req, res)
  }

  // GET /resources
  list (req, res) {
    this.policy.list(req, res, this.listAllowed)
  }

  listAllowed (err, req, res) {
    if (err) {
      this.error(err, req, res, 'listAllowed')
      return
    }
    var conditions = []
    if (this.session && this.policy.isOwnerPolicy) {
      var user = this.session.data(req, res)
      if (user) {
        conditions.push([this.session.fields.association, '=', user.id])
      }
    }
    this.database.query(req, res, this.table, conditions, this.listResult)
  }

  listResult (err, req, res, results) {
    if (err) {
      this.error(err, req, res, 'listResult')
      return
    }
    res.status(200).json(this.parseList(results, req, res))
  }

  // GET /resources/:id
  show (req, res) {
    this.database.query(req, res, this.table, [['id', '=', res.locals.resourceId]], this.showFound)
  }

  showFound (err, req, res, results) {
    if (err) {
      this.error(err, req, res, 'showFound')
      return
    }
    var record = results[0]
    if (!record) {
      this.error(NOT_FOUND, req, res, 'showFound')
      return
    }
    res.locals.record = record
    this.policy.show(req, res, record, this.showAllowed)
  }

  showAllowed (err, req, res) {
    if (err) {
      this.error(err, req, res, 'showAllowed')
      return
    }
    res.status(200).json(this.parseRecord(res.locals.record, req, res))
  }

  // DELETE /resources/:id
  delete (req, res) {
    this.database.query(req, res, this.table, [['id', '=', res.locals.resourceId]], this.deleteFound)
  }

  deleteFound (err, req, res, results) {
    if (err) {
      this.error(err, req, res, 'deleteAllowed')
      return
    }
    var record = results[0]
    if (!record) {
      this.error(NOT_FOUND, req, res, 'deleteFound')
      return
    }
    res.locals.record = record
    this.policy.delete(req, res, record, this.deleteAllowed)
  }

  deleteAllowed (err, req, res) {
    if (err) {
      this.error(err, req, res, 'deleteAllowed')
      return
    }
    this.database.delete(req, res, this.table, res.locals.record.id, this.empty)
  }

  setResourceId (req, res) {
    var path = req.url
    if (typeof path === 'string' && path.length > 0) {
      while (path[0] === '/') {
        path = path.slice(1)
      }
      res.locals.resourceId = path
    }
  }

  bindMethods () {
    super.bindMethods()
    this.handleSession = this.handleSession.bind(this)
    this.create = this.create.bind(this)
    this.replace = this.replace.bind(this)
    this.update = this.update.bind(this)
    this.list = this.list.bind(this)
    this.show = this.show.bind(this)
    this.delete = this.delete.bind(this)
    this.createAllowed = this.createAllowed.bind(this)
    this.createValidated = this.createValidated.bind(this)
    this.createSaved = this.createSaved.bind(this)
    this.createConstraint = this.createConstraint.bind(this)
    this.replaceAllowed = this.replaceAllowed.bind(this)
    this.replaceFound = this.replaceFound.bind(this)
    this.replaceValidated = this.replaceValidated.bind(this)
    this.replaceSaved = this.replaceSaved.bind(this)
    this.listAllowed = this.listAllowed.bind(this)
    this.listResult = this.listResult.bind(this)
    this.showAllowed = this.showAllowed.bind(this)
    this.showFound = this.showFound.bind(this)
    this.deleteFound = this.deleteFound.bind(this)
    this.deleteAllowed = this.deleteAllowed.bind(this)
    this.parseRecord = this.parseRecord.bind(this)
    this.parseList = this.parseList.bind(this)
  }
}

exports.ResourceApp = ResourceApp
