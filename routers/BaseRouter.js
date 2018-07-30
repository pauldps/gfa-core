'use strict'

class BaseRouter {
  constructor () {
    this.methods = new Map()
    this.build()
  }

  build () {
    var methods = this.methods
    methods.set('POST', this.post)
    methods.set('PUT', this.put)
    methods.set('PATCH', this.patch)
    methods.set('GET', this.get)
    methods.set('HEAD', this.head)
    methods.set('DELETE', this.delete)
    methods.set('OPTIONS', this.options)
  }

  post (payload) {
    return payload.app.notFound(payload)
  }

  put (payload) {
    return payload.app.notFound(payload)
  }

  patch (payload) {
    return payload.app.notFound(payload)
  }

  get (payload) {
    return payload.app.notFound(payload)
  }

  head (payload) {
    return payload.app.notFound(payload)
  }

  delete (payload) {
    return payload.app.notFound(payload)
  }

  options (payload) {
    return payload.app.options(payload)
  }

  handle (payload) {
    var router = payload.app.router
    router.normalize(payload)
    var fn = router.methods.get(req.method)
    if (typeof fn === 'function') {
      return fn(payload)
    }
    return payload.notFound()
  }

  normalize (payload) {
    normalizeFirebasePath(payload)
  }

  // When a Google Function is called via Firebase Hosting rewrite,
  //   the contents of req.params include the source path.
  // This method strips that path from the request object.
  normalizeFirebasePath (payload) {
    var req = payload.req
    var firebasePath = payload.app.firebasePath
    if (req.params['0']) {
      if (firebasePath && req.params['0'].startsWith(firebasePath)) {
        req.params['0'] = req.params['0'].replace(firebasePath, '')
      }
      if (req.params['0'] === '/') {
        req.params['0'] = ''
      }
    }
  }
}

exports.BaseRouter = BaseRouter
