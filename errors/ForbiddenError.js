'use strict'

class ForbiddenError extends Error {
  constructor () {
    super(...arguments)
    if (!this.message) {
      this.message = 'FORBIDDEN'
    }
    this.status = 403
  }
}

exports.ForbiddenError = ForbiddenError
