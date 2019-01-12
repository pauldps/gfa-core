'use strict'

const chai = require('chai')
const expect = chai.expect

const { UsersApp } = require('../../apps/UsersApp')
const { SessionsApp } = require('../../apps/SessionsApp')
const { ResourceRouter } = require('../../routers/ResourceRouter')
const { SessionsRouter } = require('../../routers/SessionsRouter')
const { MockDatabaseAdapter } = require('../mocks/MockDatabaseAdapter')
const { MockSessionAdapter } = require('../mocks/MockSessionAdapter')
const { MockPasswordAdapter } = require('../mocks/MockPasswordAdapter')
const { emulator, setApp } = require('../support/emulator')

describe('UsersApp', function () {
  var record, response
  var user = 'user'
  var pass = 'pass123'
  var id = null

  var database = new MockDatabaseAdapter()
  var password = new MockPasswordAdapter()
  var session = new MockSessionAdapter({
    secret: 'test',
    fields: {
      primary: 'u',
      username: 'u',
      password: 'p',
      email: 'e',
      role: 'r',
      association: 'usr'
    }
  })
  var usersApp = new UsersApp({
    database,
    session,
    password,
    router: new ResourceRouter(),
    table: 'Usr',
    timestamps: {
      created: 'cT',
      updated: 'uT'
    }
  })
  var sessionsApp = new SessionsApp({
    database,
    session,
    password,
    router: new SessionsRouter(),
    table: usersApp.table
  })

  before(function () {
    setApp(usersApp)
  })

  function login (user, pass) {
    setApp(sessionsApp)
    var data = { u: user, p: pass }
    return chai.request(emulator).post('/').send(data).then(res => {
      setApp(usersApp)
      return res.get('x-token')
    })
  }

  describe('create', function () {
    context('valid record', function () {
      before(function () {
        let data = { u: user, p: pass, e: 'a@b.com', r: 'admin' }
        return chai.request(emulator).post('/').send(data).then(res => {
          response = res
          record = response.body
          id = record.id
        })
      })

      it('is successful', function () {
        expect(response).to.have.status(201)
      })

      it('responds with created record', function () {
        expect(response.body.id).to.exist()
        expect(response.body.u).to.equal('user')
      })

      it('removes password and email from response', function () {
        expect(response.body.p).to.not.exist()
        expect(response.body.e).to.not.exist()
      })

      it('does not save role', function () {
        expect(response.body.r).to.not.equal('admin')
      })

      it('timestamps record', function () {
        expect(response.body.cT).to.exist()
        expect(response.body.uT).to.exist()
      })
    })
  })

  describe('show', function () {
    context('without credentials', function () {
      before(function () {
        return chai.request(emulator).get(`/${id}`).then(res => {
          response = res
        })
      })

      it('returns unauthorized', function () {
        expect(response).to.have.status(401)
      })
    })

    context('with credentials matching requested ID', function () {
      before(function () {
        return login(user, pass).then(token => {
          return chai.request(emulator).get(`/${id}`).set('authorization', token).then(res => {
            response = res
          })
        })
      })

      it('is successful', function () {
        expect(response).to.have.status(200)
      })

      it('returns record data', function () {
        expect(response.body.id).to.equal(id)
      })
    })

    context.skip('with credentials not matching requested ID', function () {
      // TODO
      before(function () {
        return login(user, pass).then(token => {
          return chai.request(emulator).get(`/${id}`).set('authorization', token).then(res => {
            response = res
          })
        })
      })

      it('is successful', function () {
        expect(response).to.have.status(200)
      })

      it('returns record data', function () {
        expect(response.body.id).to.equal(id)
      })
    })
  })

  describe('list', function () {
    context('without credentials', function () {
      before(function () {
        return chai.request(emulator).get('/').then(res => {
          response = res
        })
      })

      it('returns unauthorized', function () {
        expect(response).to.have.status(401)
      })
    })

    context.skip('with non-admin credentials', function () {
      // TODO
    })

    context.skip('with admin credentials', function () {
      // TODO
    })
  })

  describe.skip('update', function () {
    context('valid record', function () {
      before(function () {
        let data = { b: 1 }
        return chai.request(emulator).patch(`/${record.id}`).send(data).then(res => {
          response = res
        })
      })

      it('is successful', function () {
        expect(response).to.have.status(200)
      })

      it('changes the given property', function () {
        expect(response.body.b).to.equal(1)
      })

      it('keeps other properties unchanged', function () {
        expect(response.body.a).to.equal('1')
        expect(response.body.c).to.equal('3')
        expect(response.body.metadata.a).to.equal(4)
        expect(response.body.metadata.b[0]).to.equal(5)
        expect(response.body.metadata.b[1]).to.equal('6')
        expect(response.body.id).to.exist()
      })

      it('keeps createdAt', function () {
        expect(response.body.createdAt).to.equal(record.createdAt)
      })

      it('modifies updatedAt', function () {
        expect(response.body.updatedAt).to.not.equal(record.updatedAt)
      })
    })
  })

  describe.skip('replace', function () {
    context('valid record', function () {
      before(function () {
        let data = { b: 3 }
        return chai.request(emulator).put(`/${record.id}`).send(data).then(res => {
          response = res
        })
      })

      it('is successful', function () {
        expect(response).to.have.status(200)
      })

      it('replaces the record', function () {
        expect(response.body.a).to.not.exist()
        expect(response.body.b).to.equal(3)
        expect(response.body.c).to.not.exist()
        expect(response.body.metadata).to.not.exist()
        expect(response.body.password).to.not.exist()
      })

      it('keeps createdAt', function () {
        expect(response.body.createdAt).to.equal(record.createdAt)
      })

      it('modifies updatedAt', function () {
        expect(response.body.updatedAt).to.not.equal(record.updatedAt)
      })
    })
  })

  describe.skip('delete', function () {
    context('on existing record', function () {
      before(function () {
        return chai.request(emulator).delete(`/${record.id}`).then(res => {
          response = res
        })
      })

      it('is successful with empty response', function () {
        expect(response).to.have.status(204)
      })

      it('deletes the record', function () {
        return chai.request(emulator).get(`/${record.id}`).then(res => {
          expect(res).to.have.status(404)
        })
      })
    })

    context('on non-existing record', function () {
      it('returns 404', function () {
        return chai.request(emulator).delete(`/${record.id}`).then(response => {
          expect(response).to.have.status(404)
        })
      })
    })
  })
})
