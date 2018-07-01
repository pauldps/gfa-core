const expect = require('chai').expect

// Save any calls to console.error to a map
//   that can be accessed during tests
var ConsoleErrorInterceptor = function (source, error) {
  // console.log('Captured', source, error.message)
  ConsoleErrorInterceptor.errors.set(source, error.message)
}

const ConsoleError = console.error

ConsoleErrorInterceptor.errors = new Map()

ConsoleErrorInterceptor.reset = function () {
  ConsoleErrorInterceptor.errors.clear()
}

ConsoleErrorInterceptor.activate = function () {
  console.error = ConsoleErrorInterceptor
}

ConsoleErrorInterceptor.deactivate = function () {
  console.error = ConsoleError
}

ConsoleErrorInterceptor.expect = function (source, errorCode) {
  var code = ConsoleErrorInterceptor.errors.get(source)
  if (!code) {
    throw new Error(`expected error in ${source} did not happen`)
  }
  expect(code).to.equal(errorCode)
}

module.exports = ConsoleErrorInterceptor
