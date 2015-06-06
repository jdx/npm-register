'use strict';

let co     = require('co');
let npm    = require('./npm');
let s3     = require('./s3');
let config = require('./config');

function* savePkg (pkg) {
  console.log('saving', pkg.name);
  let data = new Buffer(JSON.stringify(pkg));
  yield s3.putBuffer(data, `/packages/${pkg.name}`, {
    'Content-Type': 'application/json'
  });
}

function refreshPkg (npmPkg) {
  co(function* () {
    let s3Pkg = yield s3.getFile(`/packages/${npmPkg.name}`);
    if (!s3Pkg) {
      yield savePkg(npmPkg);
      return;
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
    let s3Pkg = yield s3.getFile(`/packages/${name}`);
    if (!s3Pkg) {
      return 404;
    }
    console.error('serving', name, 'from s3');
    return JSON.parse(s3Pkg);
  }
  refreshPkg(npmPkg);
  return npmPkg;
}

exports.get = function* get (name, etag) {
  let pkg = yield findPkg(name, etag);
  if (pkg === 304 || pkg === 404) { return pkg; }
  for (let version of Object.keys(pkg.versions)) {
    let dist = pkg.versions[version].dist;
    dist.tarball = dist.tarball.replace(`http://${config.uplink.hostname}`, config.host);
  }
  return pkg;
};
