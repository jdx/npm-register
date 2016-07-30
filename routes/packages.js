'use strict'

const r = require('koa-router')()
const packages = require('../lib/packages')
const tarballs = require('../lib/tarballs')
const config = require('../config')
const path = require('path')

// get package metadata
r.get('/:name', function * () {
  let etag = this.req.headers['if-none-match']
  let pkg = yield packages.get(this.params.name, etag)
  if (pkg === 304) {
    this.status = 304
    return
  }
  if (pkg === 404) {
    this.status = 404
    this.body = {error: 'no such package available'}
    return
  }
  let cloudfront = this.headers['user-agent'] === 'Amazon CloudFront'
  packages.rewriteTarballURLs(pkg, cloudfront ? config.cloudfrontHost : this.headers.host)
  this.set('ETag', pkg.etag)
  this.set('Cache-Control', `public, max-age=${config.cache.packageTTL}`)
  this.body = pkg
})

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
