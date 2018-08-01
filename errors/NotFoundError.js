'use strict'

class NotFoundError extends Error {
  constructor () {
    super(...arguments)
    this.status = 404
  }
}

exports.NotFoundError = NotFoundError
