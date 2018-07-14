'use strict'

const {BaseApp} = require('./BaseApp')

class ResourceApp extends BaseApp {
  constructor (options) {
    super(options)
    if (!options.database) {
      throw new Error('APP_DATABASE_ADAPTER_REQUIRED')
    }
    this.database = options.database
    this.build()
  }

  // POST /resources
  create (req, res) {
    // TODO
  }

  // PUT /resources
  replace (req, res) {
    // TODO
  }

  // PATCH /resources
  update (req, res) {
    // TODO
  }

  // GET /resources
  list (req, res) {
    // TODO
  }

  // GET /resources/:id
  show (req, res) {
    // TODO
  }

  // DELETE /resources/:id
  delete (req, res) {
    // TODO
  }

  proxify () {
    super.proxify()
    this.proxy.create = this.create.bind(this)
    this.proxy.replace = this.replace.bind(this)
    this.proxy.update = this.update.bind(this)
    this.proxy.list = this.list.bind(this)
    this.proxy.show = this.show.bind(this)
    this.proxy.delete = this.delete.bind(this)
  }
}

exports.ResourceApp = ResourceApp
