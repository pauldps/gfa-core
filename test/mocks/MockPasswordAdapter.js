'use strict'

const {PasswordAdapter} = require('../../adapters/PasswordAdapter')

class MockPasswordAdapter extends PasswordAdapter {
  validate (req, res, hash, plain, callback) {
    callback(null, req, res, (hash === plain))
  }
}

exports.MockPasswordAdapter = MockPasswordAdapter
