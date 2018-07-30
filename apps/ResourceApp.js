'use strict'

const {BaseApp} = require('./BaseApp')

class ResourceApp extends BaseApp {
  constructor (opts) {
    var options = opts || {}
    if (!options.database) {
      throw new Error('APP_DATABASE_ADAPTER_REQUIRED')
    }
    if (!options.table) {
      throw new Error('APP_TABLE_REQUIRED')
    }
    super(options)
    this.database = options.database
    this.table = options.table
    this.build()
  }

  validate (req, res, callback) {
    // By default, does nothing. Apps that need validation
    //   should overwrite this method in a subclass.
    callback(null, req, res)
  }

  // POST /resources
  create (req, res) {
    this.validate(req, res, this.proxy.createAfterValidate)
  }

  createAfterValidate (err, req, res) {
    if (err) {
      return this.error(err, req, res)
    }
    this.database.insert(req, res, this.table, req.body, this.proxy.createAfterInsert)
  }

  createAfterInsert (err, req, res) {
    if (err) {
      return this.error(err, req, res)
    }
    res.status(201).json(req.body)
  }

  // PUT /resources
  replace (req, res) {
    this.validate(req, res, this.proxy.replaceAfterValidate)
  }

  replaceAfterValidate (err, req, res) {
    if (err) {
      return this.error(err, req, res)
    }
    //
  }

  // PATCH /resources
  update (req, res) {
    this.validate(req, res, this.proxy.updateAfterValidate)
  }

  updateAfterValidate (err, req, res) {
    if (err) {
      return this.error(err, req, res)
    }
    //
  }

  // GET /resources
  list (req, res) {
    // TODO
  }

  // Finds a record by ID
  find (req, res, callback) {
    //
  }

  // GET /resources/:id
  show (req, res) {
    this.find(req, res, this.proxy.showResource)
  }

  showResource (err, req, res) {
    if (err) {
      return this.error(err, req, res)
    }
    //
  }

  // DELETE /resources/:id
  delete (req, res) {
    this.find(req, res, this.proxy.deleteResource)
  }

  deleteResource (err, req, res) {
    if (err) {
      return this.error(err, req, res)
    }
    //
  }

  proxify () {
    super.proxify()
    this.proxy.validate = this.validate.bind(this)
    this.proxy.create = this.create.bind(this)
    this.proxy.replace = this.replace.bind(this)
    this.proxy.update = this.update.bind(this)
    this.proxy.createAfterValidate = this.createAfterValidate.bind(this)
    this.proxy.createAfterInsert = this.createAfterInsert.bind(this)
    this.proxy.replaceAfterValidate = this.replaceAfterValidate.bind(this)
    this.proxy.updateAfterValidate = this.updateAfterValidate.bind(this)
    this.proxy.list = this.list.bind(this)
    this.proxy.show = this.show.bind(this)
    this.proxy.delete = this.delete.bind(this)
  }
}

exports.ResourceApp = ResourceApp
