'use strict';

/*jshint -W079 */
let Promise = require('bluebird');
let co      = require('co');
let fs      = Promise.promisifyAll(require('fs'));
let path    = require('path');
let npm     = require('./npm');
let s3      = require('./s3');
let config  = require('./config');

function* savePkg (pkg) {
  console.log('saving', pkg.name);
  let file = path.join(config.tmp, pkg.name);
  yield fs.writeFileAsync(file, JSON.stringify(pkg));
  yield s3.put(file, `/${pkg.name}`, {
    'Content-Type': 'application/json'
  });
}

function refreshPkg (npmPkg) {
  co(function* () {
    let s3Pkg = yield s3.getFile(`/${npmPkg.name}`);
    if (!s3Pkg) {
      yield savePkg(npmPkg);
    }
    s3Pkg = JSON.parse(s3Pkg);
    if (npmPkg._rev !== s3Pkg._rev) {
      yield savePkg(npmPkg);
    }
  }).catch(function (err) {
    console.error(err.stack);
  });
}

function* findPkg (name, etag) {
  let npmPkg = yield npm.get(name, etag);
  if (npmPkg === 304) { return 304; }
  if (npmPkg === 404) {
    let s3Pkg = yield s3.get(name);
    if (!s3Pkg) {
      return 404;
    }
    console.error('serving', name, 'from s3');
    return s3Pkg;
  }
  refreshPkg(npmPkg);
  return npmPkg;
}

exports.get = function* get (name, etag) {
  let pkg = yield findPkg(name, etag);
  if (pkg === 304 || pkg === 404) { return pkg; }
  for (let version of Object.keys(pkg.versions)) {
    let dist = pkg.versions[version].dist;
    dist.tarball = dist.tarball.replace('http://registry.npmjs.org', config.host);
  }
  return pkg;
};
