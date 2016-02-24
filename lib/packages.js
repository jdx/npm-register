'use strict';

let co     = require('co');
let npm    = require('./npm');
let s3     = require('./s3');
let extend = require('util')._extend;

const errors = {
  versionExists: new Error('version already exists')
};

function* savePkg (pkg) {
  console.error('saving', pkg.name);
  let data = new Buffer(JSON.stringify(pkg));
  yield s3.putBufferAsync(data, `/packages/${pkg.name}`, {
    'Content-Type': 'application/json'
  });
}

function refreshPkg (npmPkg) {
  co(function* () {
    let s3Pkg = yield s3.download(`/packages/${npmPkg.name}`);
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

function* get (name, etag) {
  let pkg = yield npm.get(name, etag);
  if (pkg === 304) { return 304; }
  if (pkg === 404) {
    pkg = yield s3.download(`/packages/${name}`);
    if (!pkg) { return 404; }
    console.error('serving', name, 'from s3');
    return JSON.parse(pkg);
  }
  refreshPkg(pkg);
  return pkg;
}

function rewriteHost (pkg, from, to) {
  for (let version of Object.keys(pkg.versions)) {
    let dist = pkg.versions[version].dist;
    dist.tarball = dist.tarball.replace(from, to);
  }
}

function contains (arr, obj) {
  for (let x of arr) {
    if (x === obj) {
      return true;
    }
  }
  return false;
}

function* upload (pkg) {
  let existing = yield get(pkg.name);
  if (existing !== 404) {
    if (contains(Object.keys(existing.versions), pkg['dist-tags'].latest)) {
      throw errors.versionExists;
    }
    pkg.versions = extend(existing.versions, pkg.versions);
  }
  pkg.etag = Math.random().toString();
  let attachments = pkg._attachments;
  delete pkg._attachments;
  for (let filename of Object.keys(attachments)) {
    let attachment = attachments[filename];
    let data = new Buffer(JSON.stringify(attachment.data), 'base64');
    yield s3.putBufferAsync(data, `/tarballs/${pkg.name}/${filename}`, {
      'Content-Type': attachment.content_type,
      'Content-Length': attachment.length
    });
  }
  yield savePkg(pkg);
}

exports.get         = get;
exports.rewriteHost = rewriteHost;
exports.upload      = upload;
exports.errors      = errors;
