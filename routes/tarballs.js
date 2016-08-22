'use strict'

const r = require('koa-router')()
const path = require('path')
const tarballs = require('../lib/tarballs')
const config = require('../config')

function * tarball () {
  let {scope, name, filename, sha} = this.params
  let tarball = yield tarballs.get(scope ? `${scope}/${name}` : name, filename, sha)
  if (!tarball) {
    this.status = 404
    this.body = {error: 'no tarball found'}
    return
  }
  this.set('Content-Length', tarball.size)
  this.set('Cache-Control', `public, max-age=${config.cache.tarballTTL}`)
  this.body = tarball.stream
}

// get package tarball with sha
r.get('/:name/-/:filename/:sha', tarball)

// get scoped package tarball with sha
r.get('/:scope/:name/-/:filename/:sha', tarball)

// get package tarball without sha
r.get('/:name/-/:filename', function * () {
  let {name, filename} = this.params
  let ext = path.extname(filename)
  filename = path.basename(filename, ext)
  this.redirect(`/${name}/-/${filename}/a${ext}`)
})

module.exports = r
