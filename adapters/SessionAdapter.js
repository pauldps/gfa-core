'use strict'

const UNAUTHORIZED = new Error('UNAUTHORIZED')

class SessionAdapter {
  constructor (opts) {
    var options = opts || {}
    this.secret = options.secret || process.env['GFA_SESSION_SECRET']
    if (!this.secret) {
      throw new Error('SESSION_ADAPTER_REQUIRES_SECRET')
    }
    this.name = options.name || 'userSession'
    this.duration = options.duration || (24 * 60 * 60 * 1000)
    this.activeDuration = options.activeDuration || (1000 * 60 * 5)
    this.expose = options.expose || ['id']
    this.proxify()
  }

  // This method verifies the presence of credentials to validate the request.
  // It can also be called by other Google Functions that require authorization.
  authorize (req, res, callback) {
    req.authorizeCallback = callback
    this.load(req, res, this.proxy.authorizeLoaded)
  }

  // This is called after session data is loaded.
  authorizeLoaded (err, req, res) {
    var callback = req.authorizeCallback
    req.authorizeCallback = null
    if (!callback) {
      console.error('authorizeLoaded', 'request.authorizeCallback not set')
      return res.status(500).end()
    }
    if (err) {
      return callback(err, req, res, null)
    }
    var data = this.data(req, res)
    if (!data || !data.id) {
      return callback(UNAUTHORIZED, req, res, null)
    }
    callback(null, req, res, data)
  }

  /* istanbul ignore next */
  // This method should fill res.locals.session or whatever is used by data().
  // If data is not present, it should not respond with error to the callback.
  // Absence of session data is used to unauthorize the request instead.
  // Any errors in this method should be logged and responded with code 500 by the callee.
  load (req, res, callback) {
    callback(new Error('SESSION_ADAPTER_NOT_IMPLEMENTED'), req, res)
  }

  /* istanbul ignore next */
  // This method should generate a token or cookie based on the user record
  //   and set it in the response object.
  // It also should load the session data into the request.
  create (req, res, _userRecord, callback) {
    callback(new Error('SESSION_ADAPTER_NOT_IMPLEMENTED'), req, res)
  }

  /* istanbul ignore next */
  // This method should invalidate the token or delete the cookie.
  destroy (req, res, callback) {
    callback(new Error('SESSION_ADAPTER_NOT_IMPLEMENTED'), req, res)
  }

  // This method should be overridden if session data is stored in a different place.
  data (_req, res) {
    return res.locals.session
  }

  proxify () {
    this.proxy = {
      authorizeLoaded: this.authorizeLoaded.bind(this)
    }
  }
}

exports.SessionAdapter = SessionAdapter
