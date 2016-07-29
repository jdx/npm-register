'use strict'

let config = require('../config');
let storage = config.storage
let path = require('path')

module.exports = function (metric) {
  let npm = require('./npm')(metric)

  function * get (name, filename, sha) {
    let key = `/tarballs/${name}/${filename}/${sha}`
    let tarball = yield storage.fileExists(key)
    if (!tarball) {
      console.error(`saving ${key} to storage at`+key)
      tarball = yield npm.getTarball(name, filename + path.extname(sha))
      yield storage.putStreamAsync(tarball, key, {
        'content-length': tarball.headers['content-length'],
        'content-type': tarball.headers['content-type']
      })
      tarball = yield storage.streamFile(key)
    } else {
      tarball = yield storage.streamFile(key)
    }

    if (!tarball) return
    if(!config.storage){
      tarball.size = tarball.headers['content-length']
    }
    return tarball
  }

  return {
    get: get
  }
}
