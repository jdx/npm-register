'use strict'

module.exports = function * () {
  this.status = 404
  this.body = {error: 'Not found'}
}
