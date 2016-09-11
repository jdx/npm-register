'use strict'

const co = require('co')
const r = require('koa-router')()
const npm = require('../lib/npm')
const config = require('../config')
const job = require('../lib/job')
const _ = require('lodash')

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

module.exports = r
