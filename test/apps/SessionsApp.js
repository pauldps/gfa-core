'use strict'

const {SessionsApp} = require('../../apps/SessionsApp')
const {MockSessionAdapter} = require('../mocks/MockSessionAdapter')
const {MockDatabaseAdapter} = require('../mocks/MockDatabaseAdapter')
const {MockPasswordAdapter} = require('../mocks/MockPasswordAdapter')
const {SessionsRouter} = require('../../routers/SessionsRouter')

const behaves = require('../behaviors')

describe('SessionsApp', function () {
  let defaultAdapters = {
    session: new MockSessionAdapter({secret: 'mock', expose: ['id', 'username']}),
    database: new MockDatabaseAdapter(),
    password: new MockPasswordAdapter(),
    router: new SessionsRouter()
  }

  context('with default settings', function () {
    before(function () {
      this.app = new SessionsApp(defaultAdapters)
      this.app.session.test = 'token'
    })

    behaves.like.a.SessionsApp()
  })

  context('with custom settings', function () {
    before(function () {
      let options = Object.assign({
        table: 'Usr',
        fields: {primary: 'u', password: 'p'}
      }, defaultAdapters)
      options.session = new MockSessionAdapter({secret: 'mock2', expose: ['id', 'u']})
      this.app = new SessionsApp(options)
      this.app.session.test = 'token'
    })

    behaves.like.a.SessionsApp()
  })
})
