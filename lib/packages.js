'use strict';

let co     = require('co');
let s3     = require('./s3');
let extend = require('util')._extend;
let url    = require('url');
let path   = require('path');
let crypto = require('crypto');

const errors = {
  versionExists: new Error('version already exists')
};

module.exports = function (metric) {
  let npm = require('./npm')(metric);

  function* savePkg (pkg) {
    metric.profile({'s3.save_pkg': pkg.name});
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
      metric.event('error', err.stack);
    });
  }

  function* get (name, etag) {
    let pkg = yield npm.get(name, etag);
    if (pkg === 304) { return 304; }
    if (pkg === 404) {
      pkg = yield s3.download(`/packages/${name}`);
      if (!pkg) { return 404; }
      metric.event({'s3.serve': name});
      return JSON.parse(pkg);
    }
    refreshPkg(pkg);
    return pkg;
  }

  function addShaToPath(p, sha) {
    let ext      = path.extname(p);
    let filename = path.basename(p, ext);
    p            = path.dirname(p);

    p = path.join(p, `${filename}/${sha}${ext}`);
    return p;
  }

  function rewriteTarballURLs (pkg, host) {
    for (let version of Object.keys(pkg.versions)) {
      let dist = pkg.versions[version].dist;
      let u = url.parse(dist.tarball);
      u.pathname = addShaToPath(u.pathname, dist.shasum);
      u.host = host;
      dist.tarball = url.format(u);
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

      let hash = crypto.createHash('sha1');
      hash.update(data);
      let sha = hash.digest('hex');
      let ext = path.extname(filename);
      filename = path.basename(filename, ext);

      yield s3.putBufferAsync(data, `/tarballs/${pkg.name}/${filename}/${sha}${ext}`, {
        'Content-Type': attachment.content_type,
        'Content-Length': attachment.length
      });
    }
    yield savePkg(pkg);
  }

  return {
    get: get,
    rewriteTarballURLs,
    upload,
    errors,
  };
};
