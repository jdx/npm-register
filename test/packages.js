let app = require('../lib/server')
let request = require('supertest').agent(app.listen())
let user = require('../lib/user')
let redis = require('../lib/redis')
let co = require('co')
let url = require('url')
let crypto = require('crypto')
let fs = require('fs')
let config = require('../lib/config')
let expect = require('unexpected')
let sinon = require('sinon')
let http = require('http-call').HTTP

// make sure this user is in the htpasswd file
const testUser = {name: 'test', password: 'test'}

function * deleteItems (prefix) {
  let items = yield config.storage.list(prefix)
  for (let item of items) {
    console.log(`deleting ${item}`)
    yield config.storage.delete(item)
  }
}

function bearer (token) {
  return function (request) {
    request.set('Authorization', `Bearer ${token}`)
  }
}

const storageBackends = process.env.AWS_SECRET_ACCESS_KEY ? ['fs', 's3'] : ['fs']

storageBackends.forEach(storage => {
  describe(storage, () => {
    let token
    beforeEach(co.wrap(function * () {
      let Storage = require('../lib/storage/' + storage)
      config.storage = new Storage()
      token = yield user.authenticate(testUser)
      sinon.spy(http, 'request')
      if (redis) sinon.stub(redis, 'zget').returns(null)
    }))
    afterEach(() => {
      http.request.restore()
      redis.zget.restore()
    })

    describe('packages', () => {
      describe('GET /:package (package metadata)', () => {
        it('returns a package', () => {
          return request.get('/mocha')
            .accept('json')
            .expect(200)
            .then((r) => expect(r.body.name, 'to equal', 'mocha'))
        })
        it('can be configured to require authentication', () => {
          config.auth.read = true
          return request.get('/mocha')
            .expect(401)
            .then(() =>
              request.get('/mocha')
                .use(bearer(token))
                .expect(200))
        })
        it('can request from npm using basic auth', () => {
          config.auth.read = false
          config.npm.basic = 'testing basic auth'
          return request.get('/mocha')
            .accept('json')
            .expect(200)
            .then((r) => {
              let requestHeaders = http.request.getCall(0).args[1].headers
              expect(requestHeaders.Authorization, 'to equal', 'Basic testing basic auth')
              expect(r.body.name, 'to equal', 'mocha')
            })
        })
        it('can request from npm using an auth token', () => {
          config.auth.read = false
          config.npm.basic = null
          config.npm.token = 'testing auth token'
          return request.get('/mocha')
            .accept('json')
            .expect(200)
            .then((r) => {
              let requestHeaders = http.request.getCall(0).args[1].headers
              expect(requestHeaders.Authorization, 'to equal', 'Bearer testing auth token')
              expect(r.body.name, 'to equal', 'mocha')
            })
        })
      })

      describe('GET /:package/-/:filename (package tarball)', () => {
        before(co.wrap(function * () {
          yield deleteItems('tarballs/mocha')
        }))

        it('returns a package tarball', () => {
          return request.get('/mocha')
            .accept('json')
            .expect(200)
            .then((r) => r.body.versions['1.0.0'].dist)
            .then((dist) => {
              return new Promise(resolve => {
                let req = request.get(url.parse(dist.tarball).path)
                let hash = crypto.createHash('sha1')
                hash.setEncoding('hex')
                req.pipe(hash)
                req.on('end', () => {
                  hash.end()
                  let sha = hash.read()
                  expect(sha, 'to equal', dist.shasum)
                  resolve()
                })
              })
            })
        })
        it('can be configured to require authentication', () => {
          config.auth.read = true
          return request.get('/mocha/-/package.json')
            .expect(401)
            .then(() =>
              request.get('/mocha/-/package.json')
                .use(bearer(token))
                .expect(302))
        })
        it('can request tarballs from npm using basic auth', () => {
          config.auth.read = false
          config.npm.basic = 'tarball basic auth'
          return request.get('/mocha')
            .accept('json')
            .expect(200)
            .then((r) => r.body.versions['1.0.0'].dist)
            .then((dist) => {
              request.get(url.parse(dist.tarball).path)
              let requestHeaders = http.request.getCall(0).args[1].headers
              expect(requestHeaders.Authorization, 'to equal', 'Basic tarball basic auth')
            })
        })
        it('can request tarballs from npm using basic auth', () => {
          config.auth.read = false
          config.npm.basic = null
          config.npm.token = 'tarball auth token'
          return request.get('/mocha')
            .accept('json')
            .expect(200)
            .then((r) => r.body.versions['1.0.0'].dist)
            .then((dist) => {
              request.get(url.parse(dist.tarball).path)
              let requestHeaders = http.request.getCall(0).args[1].headers
              expect(requestHeaders.Authorization, 'to equal', 'Bearer tarball auth token')
            })
        })
      })

      describe('PUT /:package (npm publish)', () => {
        beforeEach(co.wrap(function * () {
          yield deleteItems('tarballs/elephant-sample')
          yield deleteItems('packages/elephant-sample')
        }))

        const pkg = {
          name: 'elephant-sample',
          'dist-tags': {latest: '1.0.0'},
          versions: {
            '1.0.0': {
              dist: {
                shasum: '13ac99afb9147d64649e62077a192f32b37c846d',
                tarball: 'http://localhost:3000/elephant-sample/-/elephant-sample-1.0.0.tgz'
              }
            }
          },
          _attachments: {
            'elephant-sample-1.0.0.tgz': {
              content_type: 'application/octet-stream',
              data: fs.readFileSync('./test/fixtures/elephant-sample.tar.gz', {encoding: 'base64'})
            }
          }
        }

        it('adds a package', () => {
          return request.put('/mocha')
            .use(bearer(token))
            .send(pkg)
            .expect(200)
        })
        it('can be configured to skip authentication', () => {
          return request.put('/mocha')
            .send(pkg)
            .expect(401)
            .then(() => {
              config.auth.write = false
              return request.put('/mocha')
                .send(pkg)
                .expect(200)
            })
        })
      })

      describe('PUT /:package (npm publish)', () => {
        before(co.wrap(function * () {
          token = yield user.authenticate(testUser)
          yield deleteItems('tarballs/elephant-sample')
          yield deleteItems('packages/elephant-sample')

          config.storage.put('packages/elephant-sample', {
            'dist-tags': {latest: '1.0.0', alpha: '2.0.0'},
            'versions': {
              '1.0.0': {'dist': {
                'shasum': '2f0cd4c569a2948dc9883fe9e622e4d0898f7c3e',
                'tarball': 'http://localhost:3000/elephant-sample/-/elephant-sample-1.0.0.tgz'
              }},
              '2.0.0': {'dist': {
                'shasum': '776a348f26080c4116f62dff7a6079e0c4a795a7',
                'tarball': 'http://localhost:3000/elephant-sample/-/elephant-sample-2.0.0.tgz'
              }}
            }
          })
        }))

        const pkg = {
          name: 'elephant-sample',
          'dist-tags': {beta: '3.0.0'},
          versions: {
            '3.0.0': {
              dist: {
                shasum: '13ac99afb9147d64649e62077a192f32b37c846d',
                tarball: 'http://localhost:3000/elephant-sample/-/elephant-sample-3.0.0.tgz'
              }
            }
          },
          _attachments: {
            'elephant-sample-3.0.0.tgz': {
              content_type: 'application/octet-stream',
              data: fs.readFileSync('./test/fixtures/elephant-sample.tar.gz', {encoding: 'base64'})
            }
          }
        }

        it('updates a package', () => {
          return request.put('/elephant-sample')
            .use(bearer(token))
            .send(pkg)
            .expect(200)
            .then(() => {
              return request.get('/-/package/elephant-sample/dist-tags')
                .accept('json')
                .expect(200)
                .then((r) => expect(r.body, 'to satisfy', {latest: '1.0.0', alpha: '2.0.0', beta: '3.0.0'}))
                .then(() => {
                  return request.get('/elephant-sample')
                    .accept('json')
                    .expect(200)
                    .then((r) => expect(r.body['dist-tags'], 'to satisfy', {latest: '1.0.0', alpha: '2.0.0', beta: '3.0.0'}))
                })
            })
        })
      })
    })
  })
})
