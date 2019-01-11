'use strict'

class UnauthorizedError extends Error {
  constructor () {
    super(...arguments)
    if (!this.message) {
      this.message = 'UNAUTHORIZED'
    }
    this.status = 401
  }
}

exports.UnauthorizedError = UnauthorizedError
