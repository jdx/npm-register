'use strict'

const path = require('path')
const storage = require('./storage')
const npm = require('./npm')

function * get (name, filename, sha) {
  let key = path.join('tarballs', name, filename, sha)
  let tarball = yield storage.stream(key)
  if (tarball) return tarball

  console.error(`Saving ${key}`)
  tarball = yield npm.getTarball(name, filename + path.extname(sha))
  if (!tarball) return
  let headers = tarball.headers
  yield storage.put(key, tarball, {
    'content-length': headers['content-length'],
    'content-type': headers['content-type']
  })
  return yield storage.stream(key)
}

module.exports = {
  get: get
}
