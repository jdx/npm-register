'use strict'

const r = require('koa-router')()
const path = require('path')
const config = require('../config')
const npm = require('../lib/npm')

function * tarball () {
  let {scope, name, filename, sha} = this.params
  let key = path.join('tarballs', scope ? `${scope}/${name}` : name, filename, sha)
  let tarball = yield config.storage.stream(key)
  if (!tarball) {
    console.log(`Loading ${key} from npm`)
    tarball = yield npm.getTarball(name, filename + path.extname(sha))
    yield config.storage.put(key, tarball.stream, {
      'content-length': tarball.resp.headers['content-length'],
      'content-type': tarball.resp.headers['content-type']
    })
    tarball = yield config.storage.stream(key)
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
