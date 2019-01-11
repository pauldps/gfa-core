'use strict'

class NotFoundError extends Error {
  constructor () {
    super(...arguments)
    if (!this.message) {
      this.message = 'NOT_FOUND'
    }
    this.status = 404
  }
}

exports.NotFoundError = NotFoundError
