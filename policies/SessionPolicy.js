'use strict'

const { PublicPolicy } = require('./PublicPolicy')

// This Policy provides a helper to retrieve session data.
// It's supposed to be extended by other Policies that require it.
class SessionPolicy extends PublicPolicy {
  session (req, res, callback /* (err, data) */) {
    var handler = this.app.session
    if (!handler) {
      callback(new Error('SESSION_POLICY_APP_SESSION_MISSING'))
      return
    }
    handler.load(req, res, err => {
      if (err) {
        // Unexpected error
        callback(err)
        return
      }
      var data = this.app.session.data(req, res)
      callback(null, data)
    })
  }
}

exports.SessionPolicy = SessionPolicy
