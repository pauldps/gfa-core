'use strict'

// Mimicks the Google Functions Emulator.
const emulator = require('express')()

const bodyParser = require('body-parser')
emulator.use(bodyParser.json())

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

// `app` in this case will be our handler.
var app = null

// dynamic route support for testing. inspired by:
// https://github.com/expressjs/express/issues/2596#issuecomment-81353034
function setApp (_app) {
  app = _app
}

emulator.use(function (req, res, next) {
  app.handle(req, res)
})

exports.emulator = emulator
exports.setApp = setApp
