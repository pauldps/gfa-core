'use strict'

class ConflictError extends Error {
  constructor () {
    super(...arguments)
    if (!this.message) {
      this.message = 'CONFLICT'
    }
    this.status = 409
  }
}

exports.ConflictError = ConflictError
