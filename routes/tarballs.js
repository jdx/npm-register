'use strict'

const r = require('koa-router')()
const path = require('path')
const config = require('../config')
const npm = require('../lib/npm')

r.get('/:scope?/:name/-/:scope2?/:filename/:sha', function * () {
  let {scope, name, filename, sha} = this.params
  let key = path.join('tarballs', scope ? `${scope}/${name}` : name, filename, sha)
  let tarball = yield config.storage.stream(key)
  if (!tarball) {
    console.log(`Loading ${key} from npm`)
    try {
      tarball = yield npm.getTarball(scope ? `${scope}/${name}` : name, filename + path.extname(sha))
    } catch (err) {
      if (err.statusCode === 404) this.throw('package not found', 404)
      else throw err
    }
    let put = config.storage.put(key, tarball.stream, {
      'content-length': tarball.resp.headers['content-length'],
      'content-type': tarball.resp.headers['content-type']
    })
    let timeout = new Promise(resolve => setTimeout(() => resolve('timeout'), config.timeout))
    if ((yield Promise.race([put, timeout])) === 'timeout') {
      config.storage.delete(key)
      this.throw(504)
    }
    tarball = yield config.storage.stream(key)
  }

  this.set('Content-Length', tarball.size)
  this.set('Cache-Control', `public, max-age=${config.cache.tarballTTL}`)
  this.body = tarball.stream
})

// get package tarball without sha
r.get('/:name/-/:filename', function * () {
  let {name, filename} = this.params
  let ext = path.extname(filename)
  filename = path.basename(filename, ext)
  this.redirect(`/${name}/-/${filename}/a${ext}`)
})

module.exports = r
