'use strict';

if (process.env.NEW_RELIC_LICENSE_KEY) require('newrelic');

let koa      = require('koa');
let gzip     = require('koa-gzip');
let r        = require('koa-route');
let morgan   = require('koa-morgan');
let parse    = require('co-body');
let fs       = require('fs');
let packages = require('./lib/packages');
let tarballs = require('./lib/tarballs');
let config   = require('./lib/config');
let user     = require('./lib/user');
let app      = koa();

app.name = 'elephant';
app.port = config.port;

app.use(morgan.middleware(config.production ? 'combined' : 'dev'));
app.use(gzip());

// static root page
app.use(r.get('/', function* () {
  this.type = 'text/html';
  this.body = fs.createReadStream(__dirname + '/public/index.html');
}));

// ping
app.use(r.get('/-/ping', function *() {
  this.body = {};
}));


// error middleware
app.use(function* (next) {
  try { yield next; }
  catch (err) {
    this.status = err.status || 500;
    this.body   = {error: err.message};
    this.app.emit('error', err, this);
  }
});

// get package metadata
app.use(r.get('/:name', function *(name) {
  let etag = this.req.headers['if-none-match'];
  let pkg = yield packages.get(name, etag);
  if (pkg === 304) {
    this.status = 304;
    return;
  }
  if (pkg === 404) {
    this.status = 404;
    this.body   = {error: 'no such package available'};
    return;
  }
  let host = this.headers.host;
  if (this.headers['user-agent'] === 'Amazon CloudFront') {
    host = config.cloudfrontHost;
  }
  packages.rewriteHost(pkg, config.uplink.hostname, host);
  // TODO: find out why this happens
  packages.rewriteHost(pkg, 'localhost:3000', host);
  this.set('ETag', pkg.etag);
  this.set('Cache-Control', `public, max-age=${config.cache.packageTTL}`);
  this.body = pkg;
}));

// get package tarball
app.use(r.get('/:name/-/:filename', function *(name, filename) {
  let tarball = yield tarballs.get(name, filename);
  if (!tarball) {
    this.status = 404;
    this.body   = {error: 'no tarball found'};
    return;
  }
  this.set('Content-Length', tarball.size);
  this.set('Cache-Control', 'public, max-age=21600');
  this.body = tarball;
}));

// login
app.use(r.put('/-/user/:user', function *() {
  let auth = yield user.authenticate(yield parse(this));
  if (auth) {
    this.status = 201;
    this.body   = {token: auth};
  } else {
    this.status = 401;
    this.body   = {error: "invalid credentials"};
  }
}));

// authenticate
app.use(function* (next) {
  if (!this.headers.authorization) {
    this.status = 401;
    this.body   = {error: 'no credentials provided'};
    return;
  }
  let token = this.headers.authorization.split(' ')[1];
  this.username = yield user.findByToken(token);
  if (!this.username) {
    this.status = 401;
    this.body   = {error: 'invalid credentials'};
    return;
  }
  yield next;
});

// whoami
app.use(r.get('/-/whoami', function *() {
  this.body = {username: this.username};
}));

// npm publish
app.use(r.put('/:name', function *() {
  let pkg = yield parse(this);
  try {
    yield packages.upload(pkg);
    this.body = yield packages.get(pkg.name);
  } catch (err) {
    if (err === packages.errors.versionExists) {
      this.body   = {error: err.toString()};
      this.status = 409;
    } else {
      throw err;
    }
  }
}));

module.exports = app;
if (!module.parent) {
  app.listen(app.port, function () {
    console.log(`${app.name} listening on port ${app.port} [${app.env}]`);
  });
}
