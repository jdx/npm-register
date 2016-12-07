'use strict'

const config = require('../config')

module.exports = function * (next) {
  try { yield next } catch (err) {
    this.status = err.status || 500
    if (this.status === 500) {
      this.opbeat.captureError(err, {
        user: {username: this.state.username},
        request: this.req
      })
    }
    if (config.production) this.body = {error: 'server error'}
    else this.body = {error: err.message}
    this.app.emit('error', err, this)
  }
}
