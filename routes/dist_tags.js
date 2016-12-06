'use strict'

const r = require('koa-router')()
const npm = require('../lib/npm')
const config = require('../config')
const parse = require('co-body')
const middleware = require('../middleware')

let getPackage = name => config.storage.getJSON(`packages/${name}`)

r.get('/-/package/:name/dist-tags', function * () {
  let {name} = this.params
  let pkg = yield npm.get(name)
  if (pkg !== 404) this.body = pkg['dist-tags']
  else {
    let pkg = yield getPackage(name)
    this.body = pkg['dist-tags']
  }
})

r.put('/-/package/:name/dist-tags/:tag', middleware.auth, function * () {
  let {name, tag} = this.params
  let version = JSON.parse(yield parse.text(this))
  let pkg = yield npm.get(name)
  if (pkg !== 404) this.throw(400, `Cannot set dist-tags, ${name} is hosted on ${config.uplink.host}`)
  pkg = yield getPackage(name)
  pkg['dist-tags'] = Object.assign(pkg['dist-tags'], {[tag]: version})
  yield config.storage.put(`packages/${name}`, pkg)
  this.body = {}
})

r.delete('/-/package/:name/dist-tags/:tag', middleware.auth, function * () {
  let {name, tag} = this.params
  let pkg = yield npm.get(name)
  if (pkg !== 404) this.throw(400, `Cannot delete dist-tags, ${name} is hosted on ${config.uplink.host}`)
  pkg = yield getPackage(name)
  delete pkg['dist-tags'][tag]
  yield config.storage.put(`packages/${name}`, pkg)
  this.body = {}
})

module.exports = r
