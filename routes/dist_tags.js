'use strict'

const co = require('co')
const r = require('koa-router')()
const npm = require('../lib/npm')
const config = require('../config')
const job = require('../lib/job')
const _ = require('lodash')
const parse = require('co-body')
const middleware = require('../middleware')

let updateDistTags = job(co.wrap(function * (name, tags) {
  let key = `dist-tags/${name}`
  let current = yield config.storage.getJSON(key)
  if (!_.isEqual(current, tags)) yield config.storage.put(key, tags)
}))

function getStorageTags (name) {
  return config.storage.getJSON(`dist-tags/${name}`)
}

r.get('/-/package/:name/dist-tags', function * () {
  let {name} = this.params
  try {
    let tags = yield npm.getDistTags(name)
    this.body = tags
    updateDistTags(name, tags)
  } catch (err) {
    let tags = yield getStorageTags(name)
    if (!tags) throw err
    this.body = tags
  }
})

r.put('/-/package/:name/dist-tags/:tag', middleware.auth, function * () {
  let {name, tag} = this.params
  let version = JSON.parse(yield parse.text(this))
  let tags = yield npm.getDistTags(name).catch(() => 'not found')
  if (tags !== 'not found') this.throw(400, `Cannot set dist-tags, ${name} is hosted on ${config.uplink.host}`)
  tags = yield getStorageTags(name)
  tags[tag] = version
  yield config.storage.put(`dist-tags/${name}`, tags)
  this.body = {}
})

r.delete('/-/package/:name/dist-tags/:tag', middleware.auth, function * () {
  let {name, tag} = this.params
  let tags = yield npm.getDistTags(name).catch(() => 'not found')
  if (tags !== 'not found') this.throw(400, `Cannot delete dist-tags, ${name} is hosted on ${config.uplink.host}`)
  tags = yield getStorageTags(name)
  delete tags[tag]
  yield config.storage.put(`dist-tags/${name}`, tags)
  this.body = {}
})

module.exports = r
