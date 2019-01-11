'use strict'

const chai = require('chai')
const expect = chai.expect
const { emulator, setApp } = require('../support/emulator')

var { behaves } = require('./namespace')

behaves.like.a.SessionsApp = function () {
  let pass1, pass2

  before(function (done) {
    setApp(this.app)
    this.primaryField = this.app.session.fields.primary
    this.passwordField = this.app.session.fields.password
    var db = this.app.database
    var pw = this.app.password
    pw.generate(null, null, '123', (err, req, res, hash) => {
      if (err) return done(err)
      pass1 = hash
      pw.generate(null, null, '456', (err, req, res, hash) => {
        if (err) return done(err)
        pass2 = hash
        var record1 = { id: 1 }
        var record2 = { id: 2 }
        record1[this.primaryField] = 'abc'
        record2[this.primaryField] = 'def'
        record1[this.passwordField] = pass1
        record2[this.passwordField] = pass2
        db.tables.set(this.app.table, [record1, record2])
        done()
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
            expect(response.body.id).to.equal(1)
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
