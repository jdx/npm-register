'use strict'

const co = require('co')
const got = require('got')
const url = require('url')
const config = require('../config')
const redis = require('./redis')

let cacheKey = name => `/packages/${name}`

function isEtagFresh (name, etag) {
  return redis.get(`${cacheKey(name)}/etag`)
  .then(cache => etag === cache)
  .catch(err => console.error(err.stack))
}

function updateEtag (name, etag) {
  redis.setex(`${cacheKey(name)}/etag`, config.cache.packageTTL, etag)
  .catch(err => console.error(err.stack))
}

function fetchFromCache (name) {
  return redis.get(cacheKey(name))
  .then(pkg => {
    if (pkg) {
      console.log(`${name} found in cache`)
      return JSON.parse(pkg)
    }
  })
  .catch(err => console.error(err.stack))
}

function updateCache (pkg) {
  if (!redis) return
  redis.setex(cacheKey(pkg.name), config.cache.packageTTL, JSON.stringify(pkg))
  .catch(err => console.error(err.stack))
}

function * get (name, etag) {
  try {
    if (etag && redis && (yield isEtagFresh(name, etag))) return 304
    let pkg = redis ? yield fetchFromCache(name) : null
    if (pkg) return pkg
    let opts = {timeout: config.timeout, headers: {}}
    if (etag) opts.headers['if-none-match'] = etag
    let res = yield got(url.resolve(config.uplink.href, '/' + name.replace(/\//, '%2F')), opts)
    pkg = JSON.parse(res.body)
    if (!pkg.versions) return 404
    pkg.etag = res.headers.etag
    updateCache(pkg)
    return pkg
  } catch (err) {
    switch (err.statusCode) {
      case 304:
        if (redis) updateEtag(name, etag)
        return 304
      case 404:
        return 404
      default:
        console.error(`error downloading ${name}: ${err.stack}`)
        return 404
    }
  }
}

function getTarball (name, filename) {
  return new Promise((resolve, reject) => {
    let stream = got.stream(`${config.uplink.href}${name}/-/${filename}`, {timeout: config.timeout})
    .on('error', reject)
    .on('response', resp => resolve({resp, stream}))
  })
}

module.exports = {
  get: co.wrap(get),
  getTarball
}
