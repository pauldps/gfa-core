'use strict'

const expect = require('chai').expect
var { behaves } = require('./namespace')

require('./DatabaseAdapterQueryResult')

behaves.like.a.DatabaseAdapter = function () {
  let task1 = { name: 'task 1', active: true }
  let task2 = { id: 'task2', name: 'task 2', active: false }
  let note1 = { name: 'note 1' }

  describe('#create', function () {
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

    it('creates record', function () {
      expect(task1.id).to.exist()
      expect(task2.id).to.exist()
      expect(note1.id).to.exist()
    })

    it('respects customId option', function () {
      if (this.adapter.customId) {
        expect(task2.id).to.equal('task2')
      } else {
        expect(task2.id).to.not.equal('task2')
      }
    })
  })

  describe('#query', function () {
    context('on tasks without conditions', function () {
      before(function (done) {
        this.adapter.query(null, null, 'tasks', null, (err, _req, _res, results) => {
          if (err) return done(err)
          this.results = results
          done()
        })
      })

      behaves.like.a.DatabaseAdapterQueryResult()

      it('returns all records', function () {
        expect(this.results).to.have.lengthOf(2)
      })
    })

    context('on notes without conditions', function () {
      before(function (done) {
        this.adapter.query(null, null, 'notes', null, (err, _req, _res, results) => {
          if (err) return done(err)
          this.results = results
          done()
        })
      })

      behaves.like.a.DatabaseAdapterQueryResult()

      it('returns all records', function () {
        expect(this.results).to.have.lengthOf(1)
      })
    })

    context('with conditions', function () {
      describe('by existing id', function () {
        before(function (done) {
          this.adapter.query(null, null, 'tasks', [['id', '=', task1.id]], (err, _req, _res, results) => {
            if (err) return done(err)
            this.results = results
            done()
          })
        })

        behaves.like.a.DatabaseAdapterQueryResult()

        it('returns one record', function () {
          expect(this.results).to.have.lengthOf(1)
          expect(this.results[0].name).to.equal('task 1')
        })
      })

      describe('by non-existing id', function () {
        before(function (done) {
          this.adapter.query(null, null, 'tasks', [['id', '=', 999]], (err, _req, _res, results) => {
            if (err) return done(err)
            this.results = results
            done()
          })
        })

        behaves.like.a.DatabaseAdapterQueryResult()

        it('returns empty list', function () {
          expect(this.results).to.have.lengthOf(0)
        })
      })

      describe('by non-id field', function () {
        before(function (done) {
          this.adapter.query(null, null, 'tasks', [['active', '=', true]], (err, _req, _res, results) => {
            if (err) return done(err)
            this.results = results
            done()
          })
        })

        behaves.like.a.DatabaseAdapterQueryResult()

        it('returns matching records', function () {
          expect(this.results.length).to.be.above(0)
          for (var record of this.results) {
            expect(record.active).to.equal(true)
          }
        })
      })
    })
  })

  describe('#delete', function () {
    before(function (done) {
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

    it('deletes records', function (done) {
      this.adapter.query(null, null, 'notes', null, (err, _req, _res, results) => {
        if (err) return done(err)
        expect(results).to.have.lengthOf(0)
        this.adapter.query(null, null, 'tasks', null, (err, _req, _res, results) => {
          if (err) return done(err)
          expect(results).to.have.lengthOf(0)
          done()
        })
      })
    })
  })
}

exports.behaves = behaves
