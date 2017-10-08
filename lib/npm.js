const url = require('url')
const {HTTP} = require('http-call')
const config = require('./config')
const redis = require('./redis')
const warn = require('./warn')
const {cacheKey} = require('./cache')

let authHeader

if (config.npm.basic) {
  authHeader = `Basic ${config.npm.basic}`
} else if (config.npm.token) {
  authHeader = `Bearer ${config.npm.token}`
}

async function isEtagFresh (name, etag) {
  try {
    let cache = await redis.get(`${cacheKey(name)}/etag`)
    return etag === cache
  } catch (err) {
    warn(err, {pkg: name})
  }
}

async function updateEtag (name, etag) {
  try {
    await redis.setex(`${cacheKey(name)}/etag`, config.cache.packageTTL, etag)
  } catch (err) {
    warn(err, {pkg: name})
  }
}

async function fetchFromCache (name) {
  try {
    let pkg = await redis.zget(cacheKey(name))
    if (pkg) {
      console.log(`${name} found in redis`)
      return JSON.parse(pkg)
    }
  } catch (err) {
    warn(err, {pkg: name})
  }
}

async function updateCache (pkg) {
  if (!redis) return
  try {
    await redis.zsetex(cacheKey(pkg.name), config.cache.packageTTL, JSON.stringify(pkg))
  } catch (err) {
    warn(err, {pkg: pkg.name})
  }
}

async function get (name, etag) {
  try {
    if (etag && redis && (await isEtagFresh(name, etag))) return 304
    let pkg = redis ? await fetchFromCache(name) : null
    if (pkg) return pkg
    let opts = {timeout: config.timeout, headers: {}}
    if (etag) opts.headers['if-none-match'] = etag
    if (authHeader) opts.headers['Authorization'] = authHeader
    let req = await HTTP.request(url.resolve(config.uplink.href, '/' + name.replace(/\//, '%2F')), opts)
    pkg = req.body
    if (!pkg.versions) return 404
    pkg.etag = req.response.headers.etag
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
        warn(err, {pkg: name})
        return 404
    }
  }
}

function getTarball (name, filename) {
  let opts = {timeout: config.timeout, headers: {}}
  if (authHeader) opts.headers['Authorization'] = authHeader
  return HTTP.stream(`${config.uplink.href}${name}/-/${filename}`, opts)
}

async function getLatest (name) {
  let pkg = await get(name)
  let v = pkg['dist-tags'].latest
  return pkg.versions[v]
}

module.exports = {
  get: get,
  getTarball,
  getLatest
}
