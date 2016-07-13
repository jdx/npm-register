'use strict'

let Promise = require('bluebird')
let https = require('https')
let got = require('got')
let co = require('co')
let url = require('url')
let config = require('../config')
let redis = require('./redis')

module.exports = function (metric) {
  function rediserr () {
    console.error(`cannot connect to redis. state: ${redis.status}`)
  }

  function cacheKey (name) {
    return `/packages/${name}`
  }

  function * isEtagFresh (name, etag) {
    try {
      if (!etag) return
      if (redis.status !== 'ready') return rediserr()
      return etag === (yield redis.get(`${cacheKey(name)}/etag`))
    } catch (err) {
      console.error(err.stack)
    }
  }

  function updateEtag (name, etag) {
    co(function * () {
      if (redis.status !== 'ready') return rediserr()
      yield redis.setex(`${cacheKey(name)}/etag`, config.cache.packageTTL, etag)
    })
  }

  function * fetchFromCache (name) {
    try {
      if (redis.status !== 'ready') return rediserr()
      let pkg = yield redis.get(cacheKey(name))
      if (pkg) {
        console.error(`${name} found in cache`)
        return JSON.parse(pkg)
      }
    } catch (err) {
      console.error(err.stack)
    }
  }

  function updateCache (pkg) {
    co(function * () {
      if (redis.status !== 'ready') rediserr()
      yield redis.setex(cacheKey(pkg.name), config.cache.packageTTL, JSON.stringify(pkg))
    })
  }

  function * get (name, etag) {
    try {
      if (yield isEtagFresh(name, etag)) return 304
      let pkg = yield fetchFromCache(name)
      if (pkg) return pkg
      let end = metric.profile('npm.fetch', {'package': name})
      let opts = {timeout: config.timeout, headers: {}}
      if (etag) opts.headers['if-none-match'] = etag
      let res = yield got(url.resolve(config.uplink.href, '/' + name.replace(/\//, '%2F')), opts)
      pkg = JSON.parse(res.body)
      pkg.etag = res.headers.etag
      updateCache(pkg)
      end()
      return pkg
    } catch (err) {
      switch (err.statusCode) {
        case 304:
          updateEtag(name, etag)
          return 304
        case 404:
          return 404
        default:
          console.error(`error downloading ${name}: ${err}`)
          return 404
      }
    }
  }

  function getTarball (name, filename) {
    return new Promise(function (resolve, reject) {
      https.get(`${config.uplink.href}${name}/-/${filename}`, function (res) {
        if (res.statusCode === 404) {
          resolve()
          return
        }
        resolve(res)
      }).on('error', reject)
    })
  }

  return {
    get: get,
    getTarball
  }
}
