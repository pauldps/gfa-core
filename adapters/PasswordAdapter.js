'use strict'

class PasswordAdapter {
  validate (req, res, _hash, _plain, callback) {
    callback(new Error('PASSWORD_ADAPTER_NOT_IMPLEMENTED'), req, res, false)
  }

  generate (req, res, _plain, callback) {
    callback(new Error('PASSWORD_ADAPTER_NOT_IMPLEMENTED'), req, res, null)
  }
}

exports.PasswordAdapter = PasswordAdapter
