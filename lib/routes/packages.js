const r = module.exports = require('express').Router()
const path = require('path')
const pathJoinSafe = require('path-join-safe')
const url = require('url')
const packages = require('../packages')
const config = require('../config')
const middleware = require('../middleware')
const argv = require('yargs').argv
const aw = require('./asyncawait')

function addShaToPath (p, sha) {
  let ext = path.extname(p)
  let filename = path.basename(p, ext)
  p = path.dirname(p)

  p = pathJoinSafe(p, `${filename}/${sha}${ext}`)
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
// TODO middleware.auth.read
r.get('/:name', middleware.auth.read, aw(async function (req, res) {
  let etag = req.headers['if-none-match']
  let pkg = await packages.get(req.params.name, etag)
  if (pkg === 304) {
    res.status(304).end()
    return
  }
  if (pkg === 404) {
    res.status(404).json({error: 'no such package available'})
    return
  }
  let cloudfront = req.headers['user-agent'] === 'Amazon CloudFront'
  rewriteTarballURLs(pkg, cloudfront ? config.cloudfrontHost : req.headers.host, req.protocol)
  res.set('ETag', pkg.etag)
  res.set('Cache-Control', `public, max-age=${config.cache.packageTTL}`)
  res.status(200).json(pkg)
}))
