'use strict'

const user = require('../lib/user')

module.exports = function * (next) {
  if (this.headers.authorization) {
    let token = this.headers.authorization.split(' ')[1]
    this.username = yield user.findByToken(token)
  }
  if (!this.username) this.throw(401)
  yield next
}
