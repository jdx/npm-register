'use strict'
/* global describe it before */

let app = require('../server')
let request = require('supertest-as-promised').agent(app.listen())
let user = require('../lib/user')
let co = require('co')
let config = require('../config')
let expect = require('unexpected')

// make sure this user is in the htpasswd file
const testUser = {name: 'test', password: 'test'}

function bearer (token) {
  return function (request) {
    request.set('Authorization', `Bearer ${token}`)
  }
}

describe('dist-tags', () => {
  ['fs', 's3'].forEach(storage => {
    describe(storage, () => {
      let token
      before(co.wrap(function * () {
        let Storage = require('../lib/storage/' + storage)
        config.storage = new Storage()
        config.storage.put('packages/foobar123', {
          'dist-tags': {latest: '1.0.0', alpha: '2.0.0'},
          'versions': {
            '1.0.0': {'dist': {
              'shasum': '2f0cd4c569a2948dc9883fe9e622e4d0898f7c3e',
              'tarball': 'http://localhost:3000/foobar123/-/foobar123-1.0.0.tgz'
            }},
            '2.0.0': {'dist': {
              'shasum': '776a348f26080c4116f62dff7a6079e0c4a795a7',
              'tarball': 'http://localhost:3000/foobar123/-/foobar123-2.0.0.tgz'
            }}
          }
        })
        token = yield user.authenticate(testUser)
      }))

      describe('GET /-/package/heroku-debug/dist-tags', () => {
        it('returns dist-tags', () => {
          return request.get('/-/package/heroku-debug/dist-tags')
            .accept('json')
            .expect(200)
            .then((r) => expect(r.body, 'to have property', 'alpha'))
        })
      })

      describe('GET /-/package/foobar123/dist-tags', () => {
        it('returns dist-tags', () => {
          return request.get('/-/package/foobar123/dist-tags')
            .accept('json')
            .expect(200)
            .then((r) => expect(r.body, 'to satisfy', {latest: '1.0.0'}))
        })
      })

      describe('PUT /-/package/foobar123/dist-tags/beta', () => {
        it('creates a dist-tag', () => {
          return request.put('/-/package/foobar123/dist-tags/beta')
          .send('"2.0.0"')
          .use(bearer(token))
          .expect(200)
          .then(() => {
            return request.get('/-/package/foobar123/dist-tags')
            .accept('json')
            .expect(200)
            .then((r) => expect(r.body, 'to satisfy', {latest: '1.0.0', alpha: '2.0.0', beta: '2.0.0'}))
            .then(() => {
              return request.get('/foobar123')
              .accept('json')
              .expect(200)
              .then((r) => expect(r.body, 'to satisfy', {'dist-tags': {latest: '1.0.0', alpha: '2.0.0', beta: '2.0.0'}}))
            })
          })
        })
      })

      describe('DELETE /-/package/foobar123/dist-tags/beta', () => {
        it('removes a dist-tag', () => {
          return request.delete('/-/package/foobar123/dist-tags/alpha')
          .use(bearer(token))
          .expect(200)
          .then(() => {
            return request.get('/-/package/foobar123/dist-tags')
            .accept('json')
            .expect(200)
            .then((r) => expect(r.body, 'not to have property', 'alpha'))
          })
        })
      })
    })
  })
})
