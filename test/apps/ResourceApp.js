'use strict'

const chai = require('chai')
const expect = chai.expect

const {ResourceApp} = require('../../apps/ResourceApp')
const {MockDatabaseAdapter} = require('../mocks/MockDatabaseAdapter')
const {ResourceRouter} = require('../../routers/ResourceRouter')
const {emulator, setApp} = require('../support/emulator')

class TestApp extends ResourceApp {
  parse (recordOrArray) {
    if (!Array.isArray(recordOrArray)) {
      delete recordOrArray.password
    }
    return recordOrArray
  }
}

describe('ResourceApp', function () {
  let app = new TestApp({
    database: new MockDatabaseAdapter(),
    router: new ResourceRouter(),
    table: 'Tasks',
    timestamps: {
      created: 'createdAt',
      updated: 'updatedAt'
    }
  })
  // let record

  before(function () {
    setApp(app)
  })

  describe('create', function () {
    context('valid record', function () {
      let response

      before(function () {
        let data = {a: '1', b: 2, c: '3', password: '123'}
        return chai.request(emulator).post('/').send(data).then(res => {
          response = res
          // record = response.body
        })
      })

      it('is successful', function () {
        expect(response).to.have.status(201)
      })

      it('responds with created record', function () {
        expect(response.body.a).to.equal('1')
        expect(response.body.b).to.equal(2)
        expect(response.body.c).to.equal('3')
        expect(response.body.id).to.exist()
      })

      it('parses the output', function () {
        expect(response.body.password).to.not.exist()
      })

      it('timestamps the record', function () {
        expect(response.body.createdAt).to.exist()
        expect(response.body.updatedAt).to.exist()
      })
    })
  })

  describe('replace', function () {
    context('valid record', function () {
      //
    })
  })

  describe('update', function () {
    //
  })

  describe('show', function () {
    //
  })

  describe('list', function () {
    //
  })

  describe('delete', function () {
    //
  })
})
