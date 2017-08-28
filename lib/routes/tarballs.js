const r = module.exports = require('express').Router()
const aw = require('./asyncawait')
const path = require('path')
const config = require('../config')
const npm = require('../npm')
const middleware = require('../middleware')

r.get('/:scope?/:name/-/:scope2?/:filename/:sha', middleware.auth.read, aw(async function (req, res) {
  let {scope, name, scope2, filename, sha} = req.params
  if (sha.startsWith(filename)) {
    // I have no idea why the client requests this
    // just redirect to the right URL
    let url = `/${name}/-/${scope2}/${sha}`
    // TODO: fix scoped packages
    // if (scope) url = `/${scope}${url}`
    res.redirect(url)
    return
  }
  let key = path.join('tarballs', scope ? `${scope}/${name}` : name, filename, sha)
  let tarball = await config.storage.stream(key)
  if (!tarball) {
    console.log(`Loading ${key} from npm`)
    try {
      tarball = await npm.getTarball(scope ? `${scope}/${name}` : name, filename + path.extname(sha))
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({error: 'package not found'})
      } else throw err
    }
    await config.storage.put(key, tarball, {
      'content-length': tarball.headers['content-length'],
      'content-type': tarball.headers['content-type']
    })
    tarball = await config.storage.stream(key)
  }

  res.set('Content-Length', tarball.size)
  res.set('Cache-Control', `public, max-age=${config.cache.tarballTTL}`)
  tarball.stream.pipe(res)
}))

// get package tarball without sha
r.get('/:name/-/:filename', middleware.auth.read, function (req, res) {
  let {name, filename} = req.params
  let ext = path.extname(filename)
  filename = path.basename(filename, ext)
  res.redirect(`/${name}/-/${filename}/a${ext}`)
})
