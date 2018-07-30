'use strict'

class PayloadError extends Error {
  constructor (...args, payload, status, source) {
    super(args)
    this.payload = payload
    this.status = status || 500
    this.source = source || 'NO_SOURCE'
  }
}

exports.PayloadError = PayloadError
