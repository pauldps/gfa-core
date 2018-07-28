'use strict'

class PasswordAdapter {
  /* istanbul ignore next */
  validate (req, res, _hash, _plain, callback) {
    callback(new Error('PASSWORD_ADAPTER_NOT_IMPLEMENTED'), req, res, false)
  }

  /* istanbul ignore next */
  generate (req, res, _plain, callback) {
    callback(new Error('PASSWORD_ADAPTER_NOT_IMPLEMENTED'), req, res, null)
  }
}

exports.PasswordAdapter = PasswordAdapter
