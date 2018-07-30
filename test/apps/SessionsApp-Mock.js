'use strict'

const chai = require('chai')
const expect = chai.expect

const {SessionsApp} = require('../../apps/SessionsApp')
const {MockSessionAdapter} = require('../mocks/MockSessionAdapter')
const {MockDatabaseAdapter} = require('../mocks/MockDatabaseAdapter')
const {MockPasswordAdapter} = require('../mocks/MockPasswordAdapter')
const {SessionsRouter} = require('../../routers/SessionsRouter')
const {emulator, setApp} = require('../support/emulator')

describe('SessionsApp(SessionMock, DatabaseMock, PasswordMock, RouterBase)', function () {
  let defaultAdapters = {
    session: new MockSessionAdapter({secret: 'mock', expose: ['id', 'username']}),
    database: new MockDatabaseAdapter(),
    password: new MockPasswordAdapter(),
    router: new SessionsRouter()
  }
  defaultAdapters.session.tables = defaultAdapters.database.tables
  let pass1, pass2

  before(function (done) {
    var db = defaultAdapters.database
    var pw = defaultAdapters.password
    pw.generate(null, null, '123', (err, req, res, hash) => {
      if (err) return done(err)
      pass1 = hash
      pw.generate(null, null, '456', (err, req, res, hash) => {
        if (err) return done(err)
        pass2 = hash
        db.tables.set('users', [
          {id: 1, username: 'abc', password: pass1},
          {id: 2, username: 'def', password: pass2}
        ])
        db.tables.set('Usr', [
          {id: 1, u: 'abc', p: pass1}
        ])
        done()
      })
    })
  })

  after(function () {
    defaultAdapters.database.clearTable('users')
  })

  context('with default settings', function () {
    let app

    before(function () {
      app = new SessionsApp(defaultAdapters)
      app.session.app = app
      app.headers.push(['x-custom-header', 'mockheader'])
      setApp(app)
    })

    describe('POST', function () {
      context('with correct username/password', function () {
        it('is successful', function () {
          let data = {username: 'abc', password: '123'}
          return chai.request(emulator).post('/').send(data).then(response => {
            expect(response).to.have.status(201)
            expect(response.body).to.exist()
            expect(response.body.id).to.equal(1)
            expect(response.body.username).to.equal('abc')
            expect(response.body.password).to.not.exist()
            expect(response).to.have.header('x-token')
          })
        })

        it('returns correct user', function () {
          let data = {username: 'def', password: '456'}
          return chai.request(emulator).post('/').send(data).then(response => {
            expect(response).to.have.status(201)
            expect(response.body).to.exist()
            expect(response.body.id).to.equal(2)
            expect(response.body.username).to.equal('def')
            expect(response.body.password).to.not.exist()
            expect(response).to.have.header('x-token')
          })
        })
      })

      context('with incorrect username', function () {
        it('fails with status 401', function () {
          let data = {username: 'abcdef', password: '123'}
          return chai
            .request(emulator)
            .post('/')
            .send(data)
            .then(response => {
              expect(response).to.have.status(401)
              expect(response).to.not.have.header('x-token')
            })
        })
      })

      context('with incorrect password', function () {
        it('fails with status 401', function () {
          let data = {username: 'abc', password: '456'}
          return chai
            .request(emulator)
            .post('/')
            .send(data)
            .then(response => {
              expect(response).to.have.status(401)
              expect(response).to.not.have.header('x-token')
            })
        })
      })

      context('with blank username', function () {
        it('fails with status 400', function () {
          let data = {password: '123'}
          return chai
            .request(emulator)
            .post('/')
            .send(data)
            .then(response => {
              expect(response).to.have.status(400)
              expect(response).to.not.have.header('x-token')
            })
        })
      })

      context('with blank password', function () {
        it('fails with status 400', function () {
          let data = {ussername: 'abc'}
          return chai
            .request(emulator)
            .post('/')
            .send(data)
            .then(response => {
              expect(response).to.have.status(400)
              expect(response).to.not.have.header('x-token')
            })
        })
      })
    })

    describe('GET', function () {
      context('with credentials', function () {
        let token

        before(function () {
          let data = {username: 'abc', password: '123'}
          return chai
            .request(emulator)
            .post('/')
            .send(data)
            .then(response => {
              token = response.get('x-token')
            })
        })

        it('returns session data in response body', function () {
          return chai
            .request(emulator)
            .get('/')
            .set('authorization', token)
            .then(response => {
              expect(response).to.have.status(200)
              expect(response.body).to.exist()
              expect(response.body.id).to.equal(1)
              expect(response.body.username).to.equal('abc')
              expect(response.body.password).to.not.exist()
            })
        })
      })

      context('without credentials', function () {
        it('fails with status 401', function () {
          return chai
            .request(emulator)
            .get('/')
            .then(response => {
              expect(response).to.have.status(401)
              expect(response.body).to.be.empty()
            })
        })
      })
    })

    describe('DELETE', function () {
      context('with credentials', function () {
        let token

        before(function () {
          let data = {username: 'abc', password: '123'}
          return chai
            .request(emulator)
            .post('/')
            .send(data)
            .then(response => {
              token = response.get('x-token')
            })
        })

        it('returns empty body and status 204', function () {
          return chai
            .request(emulator)
            .delete('/')
            .set('authorization', token)
            .then(response => {
              expect(response).to.have.status(204)
              expect(response.body).to.be.empty()
            })
        })
      })

      context('without credentials', function () {
        it('fails with status 401', function () {
          return chai
            .request(emulator)
            .delete('/')
            .then(response => {
              expect(response).to.have.status(401)
              expect(response.body).to.be.empty()
            })
        })
      })
    })

    describe('OPTIONS', function () {
      it('returns 204 with headers', function () {
        return chai
          .request(emulator)
          .options('/')
          .then(response => {
            expect(response).to.have.status(204)
            expect(response).to.have.header('x-custom-header', 'mockheader')
            expect(response.body).to.be.empty()
          })
      })
    })
  })

  context('with custom settings', function () {
    let app

    before(function () {
      let options = Object.assign({
        table: 'Usr',
        fields: {primary: 'u', password: 'p'}
      }, defaultAdapters)
      options.session = new MockSessionAdapter({secret: 'mock', expose: ['id', 'u']})
      app = new SessionsApp(options)
      app.session.app = app
      app.session.tables = app.database.tables
      setApp(app)
    })

    it('initializes correctly', function () {
      expect(app.table).to.equal('Usr')
      expect(app.fields.primary).to.equal('u')
      expect(app.fields.password).to.equal('p')
    })

    describe('POST', function () {
      it('works correctly', function () {
        let data = {u: 'abc', p: '123'}
        return chai.request(emulator).post('/').send(data).then(response => {
          expect(response).to.have.status(201)
          expect(response.body).to.exist()
          expect(response.body.id).to.equal(1)
          expect(response.body.u).to.equal('abc')
          expect(response.body.p).to.not.exist()
        })
      })
    })
  })
})
