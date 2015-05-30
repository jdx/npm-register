'use strict';

let koa      = require('koa');
let r        = require('koa-route');
let logger   = require('koa-logger');
let packages = require('./lib/packages');
let app      = koa();

app.use(logger());

app.use(r.get('/:name', function *(name) {
  let pkg = yield packages.get(name);
  if (!pkg) {
    this.status = 404;
    return;
  }
  this.body = pkg;
}));

let server = app.listen(process.env.PORT || 3000, function () {
  console.log('server listening on ' + server.address().port);
});
