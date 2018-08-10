'use strict'

const {MockDatabaseAdapter} = require('../mocks/MockDatabaseAdapter')
const behaves = require('../behaviors')

describe('MockDatabaseAdapter', function () {
  before(function () {
    this.adapter = new MockDatabaseAdapter()
  })

  behaves.like.a.DatabaseAdapter()
})
