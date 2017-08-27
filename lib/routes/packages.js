'use strict'

const r = require('koa-router')()
const path = require('path')
const url = require('url')
const packages = require('../packages')
const config = require('../config')
const middleware = require('../middleware')
const argv = require('yargs').argv

function addShaToPath (p, sha) {
  let ext = path.extname(p)
  let filename = path.basename(p, ext)
  p = path.dirname(p)

  p = path.join(p, `${filename}/${sha}${ext}`)
  return p
}

function rewriteTarballURLs (pkg, host, protocol) {
  if (argv.alwaysHttps) {
    protocol = 'https'
  }

  for (let version of Object.keys(pkg.versions)) {
    let dist = pkg.versions[version].dist
    let u = url.parse(dist.tarball)
    u.pathname = addShaToPath(u.pathname, dist.shasum)
    u.host = host
    u.protocol = protocol
    dist.tarball = url.format(u)
  }
}

// get package metadata
r.get('/:name', middleware.auth.read, function * () {
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
  rewriteTarballURLs(pkg, cloudfront ? config.cloudfrontHost : this.headers.host, this.request.protocol)
  this.set('ETag', pkg.etag)
  this.set('Cache-Control', `public, max-age=${config.cache.packageTTL}`)
  this.body = pkg
})

module.exports = r
