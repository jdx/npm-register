'use strict';

let Bluebird = require('bluebird');
let fs       = Bluebird.promisifyAll(require('fs'));
let path     = require('path');

function mkdirp (dir) {
  return fs.accessAsync(dir)
  .catch(function () {
    return mkdirp(path.dirname(dir))
    .then(function () {
      return fs.mkdirAsync(dir);
    });
  });
}

exports.mkdirp = mkdirp;
