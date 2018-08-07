'use strict'

const {BaseApp} = require('./BaseApp')
const {PublicPolicy} = require('../policies/PublicPolicy')

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
    this.table = options.table
    this.policy = options.policy || new PublicPolicy(this)
    this.timestamps = options.timestamps || {enabled: false}
    if (this.timestamps.created || this.timestamps.updated) {
      this.timestamps.enabled = true
    }
    this.build()
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

  parseRecord (record) {
    // Does nothing by default.
    // Should be overwritten in a subclass.
    return record
  }

  parseList (recordList) {
    var record
    for (record of recordList) {
      this.parseRecord(record)
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
    this.policy.create(req, res, this.proxy.createAllowed)
  }

  createAllowed (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'createAllowed')
    }
    this.sanitize(req, res)
    delete req.body.id
    this.validate(req, res, this.proxy.createValidated)
  }

  createValidated (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'createValidated')
    }
    this.timestamp(req.body)
    this.database.insert(req, res, this.table, req.body, this.proxy.createSaved)
  }

  createSaved (err, req, res, id) {
    if (err) {
      return this.error(err, req, res, 'createSaved')
    }
    req.body.id = id
    res.status(201).json(this.parseRecord(req.body))
  }

  // PUT /resources
  replace (req, res) {
    this.policy.update(req, res, this.proxy.replaceAllowed)
  }

  replaceAllowed (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'replaceAllowed')
    }
    this.database.query(req, res, this.table, [['id', '=', res.locals.resourceId]], this.proxy.replaceFound)
  }

  replaceFound (err, req, res, results) {
    if (err) {
      return this.error(err, req, res, 'replaceFound')
    }
    var record = results[0]
    if (!record) {
      return this.error(new Error('NOT_FOUND'), req, res, 'replaceFound')
    }
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
    this.validate(req, res, this.proxy.replaceValidated)
  }

  replaceValidated (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'replaceValidated')
    }
    this.timestamp(req.body)
    this.database.replace(req, res, this.table, res.locals.resourceId, req.body, this.proxy.replaceSaved)
  }

  replaceSaved (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'replaceSaved')
    }
    req.body.id = res.locals.resourceId
    res.status(200).json(this.parseRecord(req.body))
  }

  // PATCH /resources
  update (req, res) {
    req.partialUpdate = true
    this.replace(req, res)
  }

  // GET /resources
  list (req, res) {
    this.policy.list(req, res, this.proxy.listAllowed)
  }

  listAllowed (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'listAllowed')
    }
    this.database.query(req, res, this.table, [], this.proxy.listResult)
  }

  listResult (err, req, res, results) {
    if (err) {
      return this.error(err, req, res, 'listResult')
    }
    res.status(200).json(this.parseList(results))
  }

  // GET /resources/:id
  show (req, res) {
    this.policy.show(req, res, this.proxy.showAllowed)
  }

  showAllowed (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'showAllowed')
    }
    this.database.query(req, res, this.table, [['id', '=', res.locals.resourceId]], this.proxy.showFound)
  }

  showFound (err, req, res, results) {
    if (err) {
      return this.error(err, req, res, 'showFound')
    }
    var record = results[0]
    if (!record) {
      return this.error(new Error('NOT_FOUND'), req, res, 'showFound')
    }
    res.status(200).json(this.parseRecord(record))
  }

  // DELETE /resources/:id
  delete (req, res) {
    this.policy.delete(req, res, this.proxy.deleteAllowed)
  }

  deleteAllowed (err, req, res) {
    if (err) {
      return this.error(err, req, res, 'deleteAllowed')
    }
    this.database.delete(req, res, this.table, res.locals.resourceId, this.proxy.empty)
  }

  setResourceId (req, res) {
    var path = req.url
    if (typeof path === 'string' && path.length > 0) {
      if (path[0] === '/') {
        path = path.slice(1)
      }
      res.locals.resourceId = path
    }
  }

  proxify () {
    super.proxify()
    this.proxy.create = this.create.bind(this)
    this.proxy.replace = this.replace.bind(this)
    this.proxy.update = this.update.bind(this)
    this.proxy.list = this.list.bind(this)
    this.proxy.show = this.show.bind(this)
    this.proxy.delete = this.delete.bind(this)
    this.proxy.createAllowed = this.createAllowed.bind(this)
    this.proxy.createValidated = this.createValidated.bind(this)
    this.proxy.createSaved = this.createSaved.bind(this)
    this.proxy.replaceAllowed = this.replaceAllowed.bind(this)
    this.proxy.replaceFound = this.replaceFound.bind(this)
    this.proxy.replaceValidated = this.replaceValidated.bind(this)
    this.proxy.replaceSaved = this.replaceSaved.bind(this)
    this.proxy.listAllowed = this.listAllowed.bind(this)
    this.proxy.listResult = this.listResult.bind(this)
    this.proxy.showAllowed = this.showAllowed.bind(this)
    this.proxy.showFound = this.showFound.bind(this)
    this.proxy.deleteAllowed = this.deleteAllowed.bind(this)
  }
}

exports.ResourceApp = ResourceApp
