'use strict'

const co = require('co')
const storage = require('./storage')
const url = require('url')
const path = require('path')
const crypto = require('crypto')
const npm = require('./npm')

const errors = {
  versionExists: new Error('version already exists')
}

function savePkg (pkg) {
  let key = `/packages/${pkg.name}`
  console.log(`Saving ${key}`)
  return storage.put(key, pkg, {
    'Content-Type': 'application/json'
  })
}

function refreshPkg (npmPkg) {
  co(function * () {
    let storagePkg = yield storage.getJSON(`/packages/${npmPkg.name}`)
    if (!storagePkg) {
      yield savePkg(npmPkg)
      return
    }
    if (npmPkg._rev !== storagePkg._rev) {
      yield savePkg(npmPkg)
    }
  }).catch(function (err) {
    console.error(err.stack)
  })
}

function * get (name, etag) {
  let pkg = yield npm.get(name, etag)
  if (pkg === 304) return 304
  if (pkg === 404) {
    pkg = yield storage.getJSON(`/packages/${name}`)
    if (!pkg) return 404
    return pkg
  }
  refreshPkg(pkg)
  return pkg
}

function addShaToPath (p, sha) {
  let ext = path.extname(p)
  let filename = path.basename(p, ext)
  p = path.dirname(p)

  p = path.join(p, `${filename}/${sha}${ext}`)
  return p
}

function rewriteTarballURLs (pkg, host, protocol) {
  for (let version of Object.keys(pkg.versions)) {
    let dist = pkg.versions[version].dist
    let u = url.parse(dist.tarball)
    u.pathname = addShaToPath(u.pathname, dist.shasum)
    u.host = host
    u.protocol = protocol
    dist.tarball = url.format(u)
  }
}

function * upload (pkg) {
  let existing = yield get(pkg.name)
  if (existing !== 404) {
    if (Object.keys(existing.versions).find(v => v === pkg['dist-tags'].latest)) {
      throw errors.versionExists
    }
    pkg.versions = Object.assign(existing.versions, pkg.versions)
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

    yield storage.put(`/tarballs/${pkg.name}/${filename}/${sha}${ext}`, data, {
      'Content-Type': attachment.content_type,
      'Content-Length': attachment.length
    })
  }
  yield savePkg(pkg)
}

module.exports = {
  get: get,
  rewriteTarballURLs,
  upload,
  errors
}
