'use strict'

const expect = require('chai').expect
var {behaves} = require('./namespace')

behaves.like.a.DatabaseAdapter = function () {
  describe('#query', function () {
    let task1 = {name: 'task 1', active: true}
    let task2 = {name: 'task 2', active: false}
    let note1 = {name: 'note 1'}

    before(function (done) {
      this.adapter.insert(null, null, 'tasks', task1, (err, _req, _res, id) => {
        if (err) return done(err)
        task1.id = id
        this.adapter.insert(null, null, 'tasks', task2, (err, _req, _res, id) => {
          if (err) return done(err)
          task2.id = id
          this.adapter.insert(null, null, 'notes', note1, (err, _req, _res, id) => {
            if (err) return done(err)
            note1.id = id
            done()
          })
        })
      })
    })

    after(function (done) {
      this.adapter.delete(null, null, 'tasks', task1.id, (err) => {
        if (err) return done(err)
        this.adapter.delete(null, null, 'tasks', task2.id, (err) => {
          if (err) return done(err)
          this.adapter.delete(null, null, 'notes', note1.id, (err) => {
            done(err)
          })
        })
      })
    })

    context('without conditions', function () {
      it('returns all records', function (done) {
        this.adapter.query(null, null, 'tasks', null, (err, _req, _res, results) => {
          if (err) return done(err)
          expect(results).to.be.an('array')
          expect(results).to.have.lengthOf(2)
          this.adapter.query(null, null, 'notes', null, (err, _req, _res, results) => {
            if (err) return done(err)
            expect(results).to.be.an('array')
            expect(results).to.have.lengthOf(1)
            done()
          })
        })
      })
    })

    context('with conditions', function () {
      describe('by existing id', function () {
        it('returns one record', function (done) {
          this.adapter.query(null, null, 'tasks', [['id', '=', task1.id]], (err, _req, _res, results) => {
            if (err) return done(err)
            expect(results).to.be.an('array')
            expect(results).to.have.lengthOf(1)
            expect(results[0].name).to.equal('task 1')
            done()
          })
        })
      })

      describe('by non-existing id', function () {
        it('returns empty list', function (done) {
          this.adapter.query(null, null, 'tasks', [['id', '=', 999]], (err, _req, _res, results) => {
            if (err) return done(err)
            expect(results).to.be.an('array')
            expect(results).to.have.lengthOf(0)
            done()
          })
        })
      })

      describe('by non-id field', function () {
        it('returns matching records', function (done) {
          this.adapter.query(null, null, 'tasks', [['active', '=', true]], (err, _req, _res, results) => {
            if (err) return done(err)
            expect(results).to.be.an('array')
            expect(results.length).to.be.above(0)
            let record
            for (record of results) {
              expect(record.active).to.equal(true)
            }
            done()
          })
        })
      })
    })
  })
}

exports.behaves = behaves
