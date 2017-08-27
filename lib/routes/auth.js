'use strict'

const r = require('koa-router')()
const user = require('../user')
const parse = require('co-body')
const middleware = require('../middleware')

// login
r.put('/-/user/:user', function * () {
  let auth = yield user.authenticate(yield parse(this))
  if (auth) {
    this.status = 201
    this.body = {token: auth}
  } else {
    this.status = 401
    this.body = {error: 'invalid credentials'}
  }
})

// whoami
r.get('/-/whoami', middleware.auth.always, function * () {
  this.body = {username: this.username}
})

module.exports = r
