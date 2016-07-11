'use strict'

const r = require('koa-router')()
const sendfile = require('koa-sendfile')

r.get('/', function * () {
  yield sendfile(this, __dirname + '/../public/index.html')
})

r.get('/-/ping', function * () {
  this.body = {}
})

module.exports = r
