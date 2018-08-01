'use strict'

class ForbiddenError extends Error {
  constructor () {
    super(...arguments)
    this.status = 409
  }
}

exports.ForbiddenError = ForbiddenError
