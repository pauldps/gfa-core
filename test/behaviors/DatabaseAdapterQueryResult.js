'use strict'

const expect = require('chai').expect
var { behaves } = require('./namespace')

behaves.like.a.DatabaseAdapterQueryResult = function () {
  it('is an array', function () {
    expect(this.results).to.be.an('array')
  })

  it('returns all records with id', function () {
    for (var record of this.results) {
      expect(record.id).to.exist()
    }
  })
}
