'use strict'

const config = require('../config')
const r = require('koa-router')({ prefix: config.urlPrefix })
const sendfile = require('koa-sendfile')
const path = require('path')

r.use(function * (next) {
  this.opbeat.setTransactionName(this._matchedRoute, this.method)
  yield next
})

r.get('/', function * () {
  yield sendfile(this, path.join(__dirname, '../public/index.html'))
})

r.get('/-/ping', function * () {
  this.body = {}
})

function load (name) {
  let sub = require('./' + name)
  r.use(sub.routes())
  r.use(sub.allowedMethods())
}

load('packages')
load('tarballs')
load('auth')
load('publish')
load('dist_tags')

module.exports = r
