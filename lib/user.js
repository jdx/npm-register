'use strict'

let htpasswd = require('htpasswd-auth')
let uuid = require('node-uuid')
let storage = require('../config').storage

function * getCreds () {
  return yield JSON.parse((yield storage.download('/auth_tokens')) || '{}')
}

function * createAuthToken (username) {
  let creds = yield getCreds()
  let token = uuid.v4()
  creds[token] = {
    username,
    timestamp: new Date()
  }
  yield storage.putBufferAsync(new Buffer(JSON.stringify(creds)), '/auth_tokens', {
    'Content-Type': 'application/json'
  })
  return token
}

function * authenticate (user) {
  let creds = (yield storage.download('/htpasswd')) || ''
  let auth = yield htpasswd.authenticate(user.name, user.password, creds)
  if (!auth) return false
  return yield createAuthToken(user.name)
}

function * findByToken (token) {
  let creds = yield getCreds()
  if (creds[token]) return creds[token].username
}

exports.authenticate = authenticate
exports.findByToken = findByToken
