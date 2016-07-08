'use strict'

if (!process.env.NEW_RELIC_LICENSE_KEY) process.env.NEW_RELIC_ENABLED = 'false'
process.env.NEW_RELIC_LOG = 'stdout'

let koa = require('koa')
let compress = require('koa-compress')
let r = require('koa-route')
let newrelic = require('newrelic')
let parse = require('co-body')
let fs = require('fs')
let packages = require('./lib/packages')
let tarballs = require('./lib/tarballs')
let config = require('./lib/config')
let user = require('./lib/user')
let rollbar = require('rollbar')
let path = require('path')
let app = koa()

if (config.rollbar) {
  rollbar.init(config.rollbar, {
    environment: process.env.NODE_ENV,
    codeVersion: process.env.HEROKU_SLUG_COMMIT,
    host: process.env.HEROKU_APP_NAME,
    scrubHeaders: ['authorization']
  })
  rollbar.handleUncaughtExceptions(config.rollbar)
}

app.name = 'elephant'
app.port = config.port

app.use(require('./logger'))
app.use(compress())

// static root page
app.use(r.get('/', function * () {
  newrelic.setTransactionName('')
  this.type = 'text/html'
  this.body = fs.createReadStream(path.join(__dirname, '/public/index.html'))
}))

// ping
app.use(r.get('/-/ping', function * () {
  newrelic.setTransactionName('-/ping')
  this.body = {}
}))

// error middleware
app.use(function * (next) {
  try { yield next } catch (err) {
    newrelic.noticeError(err)
    if (config.rollbar) rollbar.handleError(err, this.request)
    this.status = err.status || 500
    this.body = {error: err.message}
    this.app.emit('error', err, this)
  }
})

// get package metadata
app.use(r.get('/:name', function * (name) {
  newrelic.setTransactionName(':name')
  let etag = this.req.headers['if-none-match']
  let pkg = yield packages(this.metric).get(name, etag)
  if (pkg === 304) {
    this.status = 304
    return
  }
  if (pkg === 404) {
    this.status = 404
    this.body = {error: 'no such package available'}
    return
  }
  let cloudfront = this.headers['user-agent'] === 'Amazon CloudFront'
  packages(this.metric).rewriteTarballURLs(pkg, cloudfront ? config.cloudfrontHost : this.headers.host)
  this.set('ETag', pkg.etag)
  this.set('Cache-Control', `public, max-age=${config.cache.packageTTL}`)
  this.body = pkg
}))

// get package tarball with sha
app.use(r.get('/:name/-/:filename/:sha', function * (name, filename, sha) {
  newrelic.setTransactionName(':name/-/:filename/:sha')
  let tarball = yield tarballs(this.metric).get(name, filename, sha)
  if (!tarball) {
    this.status = 404
    this.body = {error: 'no tarball found'}
    return
  }
  this.set('Content-Length', tarball.size)
  this.set('Cache-Control', `public, max-age=${config.cache.tarballTTL}`)
  this.body = tarball
}))

// get package tarball with sha
app.use(r.get('/:scope/:name/-/:filename/:sha', function * (scope, name, filename, sha) {
  newrelic.setTransactionName(':scope/:name/-/:filename/:sha')
  let tarball = yield tarballs(this.metric).get(`${scope}/${name}`, filename, sha)
  if (!tarball) {
    this.status = 404
    this.body = {error: 'no tarball found'}
    return
  }
  this.set('Content-Length', tarball.size)
  this.set('Cache-Control', `public, max-age=${config.cache.tarballTTL}`)
  this.body = tarball
}))

// get package tarball without sha
app.use(r.get('/:name/-/:filename', function * (name, filename) {
  newrelic.setTransactionName(':name/-/:filename')
  let ext = path.extname(filename)
  filename = path.basename(filename, ext)
  this.redirect(`/${name}/-/${filename}/a${ext}`)
}))

// login
app.use(r.put('/-/user/:user', function * () {
  newrelic.setTransactionName('-/user/:user')
  let auth = yield user.authenticate(yield parse(this))
  if (auth) {
    this.status = 201
    this.body = {token: auth}
  } else {
    this.status = 401
    this.body = {error: 'invalid credentials'}
  }
}))

// authenticate
app.use(function * (next) {
  const unauthorized = new Error('unauthorized')
  if (this.headers.authorization) {
    let token = this.headers.authorization.split(' ')[1]
    this.username = yield user.findByToken(token)
  }
  this.authenticated = () => {
    if (!this.username) throw unauthorized
  }
  try {
    yield next
  } catch (err) {
    if (err !== unauthorized) throw err
    this.status = 401
    this.body = {error: 'invalid credentials'}
  }
})

// whoami
app.use(r.get('/-/whoami', function * () {
  this.authenticated()
  newrelic.setTransactionName('-/whoami')
  this.body = {username: this.username}
}))

// npm publish
app.use(r.put('/:name', function * () {
  this.authenticated()
  newrelic.setTransactionName(':name')
  let pkg = yield parse(this)
  try {
    yield packages(this.metric).upload(pkg)
    this.body = yield packages(this.metric).get(pkg.name)
  } catch (err) {
    if (err === packages(this.metric).errors.versionExists) {
      this.body = {error: err.toString()}
      this.status = 409
    } else {
      throw err
    }
  }
}))

module.exports = app
if (!module.parent) {
  app.listen(app.port, function () {
    console.error(`${app.name} listening on port ${app.port} [${app.env}]`)
  })
}
