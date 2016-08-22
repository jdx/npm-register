'use strict'

const co = require('co')
const npm = require('./npm')
const config = require('../config')

function savePkg (pkg) {
  let key = `packages/${pkg.name}`
  console.log(`Saving ${key}`)
  return config.storage.put(key, pkg)
}

function refreshPkg (npmPkg) {
  co(function * () {
    let storagePkg = yield config.storage.getJSON(`packages/${npmPkg.name}`)
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
    pkg = yield config.storage.getJSON(`packages/${name}`)
    if (!pkg) return 404
    return pkg
  }
  refreshPkg(pkg)
  return pkg
}

module.exports = {
  get: get
}
