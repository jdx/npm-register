'use strict'

const r = require('koa-router')()
const crypto = require('crypto')
const parse = require('co-body')
const path = require('path')
const middleware = require('../middleware')
const packages = require('../lib/packages')
const config = require('../config')

// npm publish
r.put('/:name', middleware.auth, function * () {
  let pkg = yield parse(this, {limit: '100mb'})
  let tags = Object.keys(pkg['dist-tags'])
  if (tags.length !== 1) this.throw(400, 'must have 1 dist-tag')
  let tag = tags[0]
  let existing = yield packages.get(pkg.name)
  if (existing !== 404) {
    if (Object.keys(existing.versions).find(v => v === pkg['dist-tags'][tag])) {
      this.body = {error: 'version already exists'}
      this.status = 409
      return
    }
    pkg.versions = Object.assign(existing.versions, pkg.versions)
    pkg['dist-tags'] = Object.assign(existing['dist-tags'], pkg['dist-tags'])
  }
  pkg.etag = Math.random().toString()
  let attachments = pkg._attachments
  delete pkg._attachments
  for (let filename of Object.keys(attachments)) {
    let attachment = attachments[filename]
    let data = new Buffer(JSON.stringify(attachment.data), 'base64')

    let hash = crypto.createHash('sha1')
    hash.update(data)
    let sha = hash.digest('hex')
    let ext = path.extname(filename)
    filename = path.basename(filename, ext)

    yield config.storage.put(`tarballs/${pkg.name}/${filename}/${sha}${ext}`, data, {
      'Content-Type': attachment.content_type,
      'Content-Length': attachment.length
    })
  }
  yield packages.save(pkg)
  this.body = yield packages.get(pkg.name)
})

module.exports = r
