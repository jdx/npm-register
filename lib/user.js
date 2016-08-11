'use strict'

const htpasswd = require('htpasswd-auth')
const uuid = require('node-uuid')
const config = require('../config')

function * getCreds () {
  return yield JSON.parse((yield config.storage.get('auth_tokens')) || '{}')
}

function * createAuthToken (username) {
  let creds = yield getCreds()
  let token = uuid.v4()
  creds[token] = {
    username,
    timestamp: new Date()
  }
  yield config.storage.put('auth_tokens', creds, {
    'Content-Type': 'application/json'
  })
  return token
}

function * authenticate (user) {
  let creds = (yield config.storage.get('htpasswd')) || ''
  let auth = yield htpasswd.authenticate(user.name, user.password, creds.toString())
  if (!auth) return false
  return yield createAuthToken(user.name)
}

function * findByToken (token) {
  let creds = yield getCreds()
  if (creds[token]) return creds[token].username
}

exports.authenticate = authenticate
exports.findByToken = findByToken
