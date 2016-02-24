'use strict';

let app     = require('../server');
let request = require('supertest-as-promised').agent(app.listen());
let user    = require('../lib/user');
let co      = require('co');

// make sure this user is in the htpasswd file
const testUser = {name: 'test', password: 'test'};

function bearer (token) {
  return function (request) {
    request.set('Authorization', `Bearer ${token}`);
  };
}

describe('user', () => {
  let token;

  describe('/-/whoami (whoami)', () => {
    describe('logged in', () => {
      before(co.wrap(function* () {
        token = yield user.authenticate(testUser);
      }));

      it('returns the username', () => {
        return request.get('/-/whoami')
        .use(bearer(token))
        .accept('json')
        .expect(200)
        .then(res => expect(res.body.username).to.eq('test'));
      });
    });
    describe('anonymous', () => {
      it('returns 401', () => {
        return request.get('/-/whoami')
        .accept('json')
        .expect(401);
      });
    });
  });

  describe('/-/user/:user (login)', () => {
    describe('valid credentials', () => {
      it('gets the token', () => {
        return request.put('/-/user/test')
        .send({name: 'test', password: 'test'})
        .accept('json')
        .expect(201)
        .then(res => expect(res.body).to.have.property('token'));
      });
    });
    describe('invalid credentials', () => {
      it('returns 401', () => {
        return request.put('/-/user/test')
        .send({name: 'test', password: 'invalid'})
        .accept('json')
        .expect(401);
      });
    });
  });
});
