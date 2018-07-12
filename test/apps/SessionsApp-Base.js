'use strict'

const chai = require('chai')
const expect = chai.expect

const {SessionsApp} = require('../../apps/SessionsApp')
const {SessionsRouter} = require('../../routers/SessionsRouter')
const {SessionAdapter} = require('../../adapters/SessionAdapter')
const {DatabaseAdapter} = require('../../adapters/DatabaseAdapter')
const {PasswordAdapter} = require('../../adapters/PasswordAdapter')
const {emulator, setApp} = require('../support/emulator')
const ConsoleErrorInterceptor = require('../support/console-error')

describe('SessionsApp(SessionBase, DatabaseBase, PasswordBase, RouterBase)', function () {
  before(ConsoleErrorInterceptor.activate)
  after(ConsoleErrorInterceptor.deactivate)

  let app

  before(function () {
    ConsoleErrorInterceptor.reset()
    app = new SessionsApp({
      session: new SessionAdapter({secret: 'abc'}),
      database: new DatabaseAdapter(),
      password: new PasswordAdapter(),
      router: new SessionsRouter()
    })
    app.headers.push(['x-custom-header', 'bbb'])
    setApp(app)
  })

  it('initializes with correct adapter types', function () {
    expect(app.session).to.be.an.instanceof(SessionAdapter)
    expect(app.database).to.be.an.instanceof(DatabaseAdapter)
    expect(app.password).to.be.an.instanceof(PasswordAdapter)
  })

  describe('POST', function () {
    it('fails with status 500', function () {
      ConsoleErrorInterceptor.reset()
      let data = {username: 'abc', password: '123'}
      return chai
        .request(emulator)
        .post('/')
        .send(data)
        .then(response => {
          expect(response).to.have.status(500)
          expect(response.body.code).to.equal('INTERNAL_ERROR')
          ConsoleErrorInterceptor.expect('signInQueryResult', 'DATABASE_ADAPTER_NOT_IMPLEMENTED')
        })
    })
  })

  describe('GET', function () {
    it('fails with status 500', function () {
      ConsoleErrorInterceptor.reset()
      return chai
        .request(emulator)
        .get('/')
        .then(response => {
          expect(response).to.have.status(500)
          expect(response.body.code).to.equal('INTERNAL_ERROR')
          ConsoleErrorInterceptor.expect('infoAuthorized', 'SESSION_ADAPTER_NOT_IMPLEMENTED')
        })
    })
  })

  describe('HEAD', function () {
    it('fails with status 500', function () {
      ConsoleErrorInterceptor.reset()
      return chai
        .request(emulator)
        .head('/')
        .then(response => {
          expect(response).to.have.status(500)
          expect(response.body).to.be.empty()
          ConsoleErrorInterceptor.expect('empty', 'SESSION_ADAPTER_NOT_IMPLEMENTED')
        })
    })
  })

  describe('DELETE', function () {
    it('fails with status 500', function () {
      ConsoleErrorInterceptor.reset()
      return chai
        .request(emulator)
        .delete('/')
        .then(response => {
          expect(response).to.have.status(500)
          expect(response.body.code).to.equal('INTERNAL_ERROR')
          ConsoleErrorInterceptor.expect('signOutAuthorized', 'SESSION_ADAPTER_NOT_IMPLEMENTED')
        })
    })
  })

  describe('OPTIONS', function () {
    it('returns 204 with headers', function () {
      ConsoleErrorInterceptor.reset()
      return chai
        .request(emulator)
        .options('/')
        .then(response => {
          expect(response).to.have.status(204)
          expect(response).to.have.header('x-custom-header', 'bbb')
        })
    })
  })

  describe('PUT', function () {
    it('returns 404', function () {
      ConsoleErrorInterceptor.reset()
      return chai
        .request(emulator)
        .put('/')
        .then(response => {
          expect(response).to.have.status(404)
          expect(response.body).to.be.empty()
        })
    })
  })

  describe('PATCH', function () {
    it('returns 404', function () {
      ConsoleErrorInterceptor.reset()
      return chai
        .request(emulator)
        .patch('/')
        .then(response => {
          expect(response).to.have.status(404)
          expect(response.body).to.be.empty()
        })
    })
  })
})
