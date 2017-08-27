'use strict'

const user = require('../user')
const config = require('../config')

function * doAuth (ctx, next) {
  if (ctx.headers.authorization) {
    let token = ctx.headers.authorization.split(' ')[1]
    ctx.username = yield user.findByToken(token)
  }
  if (!ctx.username) ctx.throw(401)
  yield next
}

module.exports = {
  read: function * (next) {
    yield (config.auth.read ? doAuth(this, next) : next)
  },
  write: function * (next) {
    yield (config.auth.write ? doAuth(this, next) : next)
  },
  always: function * (next) {
    yield doAuth(this, next)
  }
}
