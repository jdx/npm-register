'use strict';

let npm     = require('./npm');
let s3      = require('./s3');
let co      = require('co');

function refreshPkg (pkg) {
  co(function* () {
    yield s3.put(pkg);
  }).catch(function (err) {
    console.error(err.stack);
  });
}

exports.get = function* get (name) {
  let pkg = yield {
    npm: npm.get(name),
    s3:  s3.get(name)
  };
  if (!pkg.npm && !pkg.s3) {
    return;
  }
  if (!pkg.npm) {
    console.error('serving', name, 'from s3');
    return pkg.s3;
  }
  if (!pkg.s3 || pkg.npm._rev !== pkg.s3._rev) {
    refreshPkg(pkg.npm);
  }
  return pkg.npm;
};
