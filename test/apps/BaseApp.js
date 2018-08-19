'use strict'

const chai = require('chai')
const expect = chai.expect
const {emulator, setApp} = require('../support/emulator')
const {BaseApp} = require('../../apps/BaseApp')
const {BaseRouter} = require('../../routers/BaseRouter')

describe('BaseApp', function () {
  describe('cors', function () {
    before(function () {
      this.app = new BaseApp({
        router: new BaseRouter()
      })
      setApp(this.app)
    })

    context('false', function () {
      before(function () {
        this.app.cors = false
        return chai.request(emulator).options('/').then(response => {
          this.response = response
        })
      })

      it('does not add headers', function () {
        expect(this.response).to.not.have.header('Access-Control-Allow-Origin')
        expect(this.response).to.not.have.header('Access-Control-Allow-Methods')
        expect(this.response).to.not.have.header('Access-Control-Allow-Headers')
        expect(this.response).to.not.have.header('Access-Control-Allow-Credentials')
        expect(this.response).to.not.have.header('Access-Control-Max-Age')
      })
    })

    context('true', function () {
      before(function () {
        this.app.cors = true
        return chai.request(emulator).options('/').then(response => {
          this.response = response
        })
      })

      it('adds headers', function () {
        expect(this.response).to.have.header('Access-Control-Allow-Methods')
        expect(this.response).to.have.header('Access-Control-Allow-Headers')
        expect(this.response).to.have.header('Access-Control-Allow-Credentials')
        expect(this.response).to.have.header('Access-Control-Max-Age')
      })

      it('does not add origin header', function () {
        expect(this.response).to.not.have.header('Access-Control-Allow-Origin')
      })
    })

    context('dev', function () {
      before(function () {
        this.app.cors = 'dev'
        return chai.request(emulator).options('/').set('origin', 'abcde').then(response => {
          this.response = response
        })
      })

      it('sets origin header to request origin', function () {
        expect(this.response).to.have.header('Access-Control-Allow-Origin', 'abcde')
      })

      it('adds headers', function () {
        expect(this.response).to.have.header('Access-Control-Allow-Methods')
        expect(this.response).to.have.header('Access-Control-Allow-Headers')
        expect(this.response).to.have.header('Access-Control-Allow-Credentials')
        expect(this.response).to.have.header('Access-Control-Max-Age')
      })
    })
  })
})
