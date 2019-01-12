'use strict'

const chai = require('chai')
const expect = chai.expect
const { emulator, setApp } = require('../support/emulator')
const { UsersApp } = require('../../apps/UsersApp')
const { ResourceRouter } = require('../../routers/ResourceRouter')

var { behaves } = require('./namespace')

behaves.like.a.SessionsApp = function () {
  var id1

  before(function () {
    this.usersApp = new UsersApp({
      database: this.app.database,
      session: this.app.session,
      password: this.app.password,
      table: this.app.table,
      router: new ResourceRouter()
    })
    setApp(this.usersApp)
    this.primaryField = this.app.session.fields.primary
    this.passwordField = this.app.session.fields.password
    let data1 = {}
    let data2 = {}
    data1[this.primaryField] = 'abc'
    data1[this.passwordField] = '123'
    data2[this.primaryField] = 'def'
    data2[this.passwordField] = '456'
    // Create two users using the UsersApp
    return chai.request(emulator).post('/').send(data1).then(res => {
      id1 = res.body.id
      return chai.request(emulator).post('/').send(data2).then(res => {
        setApp(this.app)
      })
    })
  })

  describe('POST', function () {
    context('with correct username/password', function () {
      it('is successful', function () {
        let data = {}
        data[this.primaryField] = 'abc'
        data[this.passwordField] = '123'
        return chai.request(emulator).post('/').send(data).then(response => {
          expect(response).to.have.status(201)
          expect(response.body).to.exist()
          expect(response.body.id).to.exist()
          expect(response.body[this.primaryField]).to.equal('abc')
          expect(response.body[this.passwordField]).to.not.exist()
          expect(response).to.have.header('x-token')
        })
      })

      it('returns correct user', function () {
        let data = {}
        data[this.primaryField] = 'def'
        data[this.passwordField] = '456'
        return chai.request(emulator).post('/').send(data).then(response => {
          expect(response).to.have.status(201)
          expect(response.body).to.exist()
          expect(response.body.id).to.exist()
          expect(response.body[this.primaryField]).to.equal('def')
          expect(response.body[this.passwordField]).to.not.exist()
          if (this.app.session.test === 'token') {
            expect(response).to.have.header('x-token')
          }
        })
      })
    })

    context('with incorrect username', function () {
      it('fails with status 401', function () {
        let data = {}
        data[this.primaryField] = 'abcdef'
        data[this.passwordField] = '123'
        return chai
          .request(emulator)
          .post('/')
          .send(data)
          .then(response => {
            expect(response).to.have.status(401)
            if (this.app.session.test === 'token') {
              expect(response).to.not.have.header('x-token')
            }
          })
      })
    })

    context('with incorrect password', function () {
      it('fails with status 401', function () {
        let data = {}
        data[this.primaryField] = 'abc'
        data[this.passwordField] = '456'
        return chai
          .request(emulator)
          .post('/')
          .send(data)
          .then(response => {
            expect(response).to.have.status(401)
            if (this.app.session.test === 'token') {
              expect(response).to.not.have.header('x-token')
            }
          })
      })
    })

    context('with blank username', function () {
      it('fails with status 400', function () {
        let data = {}
        data[this.passwordField] = '123'
        return chai
          .request(emulator)
          .post('/')
          .send(data)
          .then(response => {
            expect(response).to.have.status(400)
            if (this.app.session.test === 'token') {
              expect(response).to.not.have.header('x-token')
            }
          })
      })
    })

    context('with blank password', function () {
      it('fails with status 400', function () {
        let data = {}
        data[this.primaryField] = 'abc'
        return chai
          .request(emulator)
          .post('/')
          .send(data)
          .then(response => {
            expect(response).to.have.status(400)
            if (this.app.session.test === 'token') {
              expect(response).to.not.have.header('x-token')
            }
          })
      })
    })
  })

  describe('GET', function () {
    context('with credentials', function () {
      let token

      before(function () {
        let data = {}
        data[this.primaryField] = 'abc'
        data[this.passwordField] = '123'
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
            expect(response.body.id).to.equal(id1)
            expect(response.body[this.primaryField]).to.equal('abc')
            expect(response.body[this.passwordField]).to.not.exist()
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
        let data = {}
        data[this.primaryField] = 'abc'
        data[this.passwordField] = '123'
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
          // expect(response).to.have.header('x-custom-header', 'mockheader')
          expect(response.body).to.be.empty()
        })
    })
  })
}

exports.behaves = behaves
