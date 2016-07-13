'use strict'

const r = require('koa-router')()
const sendfile = require('koa-sendfile')
const path = require('path')

r.use(function * (next) {
  this.opbeat.setTransactionName(this._matchedRoute, this.method)
  yield next
})

r.get('/', function * () {
  yield sendfile(this, path.join(__dirname, '../public/index.html'))
})

r.get('/foo/:bar', function * () {
  this.body = this.params.bar
})

r.get('/error-test', function * () {
  throw new Error('testing!')
})

r.get('/-/ping', function * () {
  this.body = {}
})

module.exports = r
