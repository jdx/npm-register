'use strict';

/*jshint -W079 */
let Promise     = require('bluebird');
let koa         = require('koa');
let gzip        = require('koa-gzip');
let r           = require('koa-route');
let logger      = require('koa-logger');
let packages    = require('./lib/packages');
let tarballs    = require('./lib/tarballs');
let config      = require('./lib/config');
let app         = koa();

if (!config.production) {
  Promise.longStackTraces();
}

app.use(logger());
app.use(gzip());

app.use(r.get('/:name/-/:filename', function *(name, filename) {
  let tarball = yield tarballs.get(name, filename);
  if (!tarball) {
    this.status = 404;
    return;
  }
  this.set('Content-Length', tarball.headers['Content-Length']);
  this.set('Cache-Control', 'public, max-age=86400');
  this.body = tarball;
}));

app.use(r.get('/:name', function *(name) {
  let etag = this.req.headers['if-none-match'];
  let pkg = yield packages.get(name, etag);
  if (pkg === 304 || pkg === 404) {
    this.status = pkg;
    return;
  }
  this.set('ETag', pkg.etag);
  this.body = pkg;
}));

let server = app.listen(process.env.PORT || 3000, function () {
  console.log('server listening on ' + server.address().port);
});
