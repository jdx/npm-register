'use strict';

let app     = require('../server');
let request = require('supertest-as-promised').agent(app.listen());
let user    = require('../lib/user');
let co      = require('co');
let url     = require('url');
let crypto  = require('crypto');

// make sure this user is in the htpasswd file
const testUser = {name: 'test', password: 'test'};

function bearer (token) {
  return function (request) {
    request.set('Authorization', `Bearer ${token}`);
  };
}

describe('packages', () => {
  let token;

  describe('/:package (package metadata)', () => {
    it('returns a package', () => {
      return request.get('/mocha')
      .accept('json')
      .expect(200)
      .then(r => expect(r.body.name).to.eq('mocha'));
    });
  });

  describe('/:package/-/:filename (package tarball)', () => {
    it('returns a package tarball', () => {
      return request.get('/mocha')
      .accept('json')
      .expect(200)
      .then(r => r.body.versions['1.0.0'].dist)
      .then(dist => {
        return new Promise(fulfill => {
          let req = request.get(url.parse(dist.tarball).path);
          let hash = crypto.createHash('sha1');
          hash.setEncoding('hex');
          req.pipe(hash);
          req.on('end', () => {
            hash.end();
            let sha = hash.read();
            expect(sha).to.eq(dist.shasum);
            fulfill();
          });
        });
      });
    });
  });
});
