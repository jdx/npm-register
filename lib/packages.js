'use strict';

let npm     = require('./npm');
let s3      = require('./s3');
let co      = require('co');

function refreshPkg (npmPkg) {
  co(function* () {
    let s3Pkg = yield s3.get(npmPkg.name);
    if (!s3Pkg || npmPkg._rev !== s3Pkg._rev) {
      yield s3.put(npmPkg);
    }
  }).catch(function (err) {
    console.error(err.stack);
  });
}

exports.get = function* get (name) {
  let npmPkg = yield npm.get(name);
  if (npmPkg) {
    refreshPkg(npmPkg);
    return npmPkg;
  }
  let s3Pkg = yield s3.get(name);
  if (!s3Pkg) {
    return;
  }
  console.error('serving', name, 'from s3');
  return s3Pkg;
};
