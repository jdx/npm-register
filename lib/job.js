'use strict'

const opbeat = require('./opbeat')

module.exports = fn => {
  return (...args) => {
    fn(...args)
    .catch(e => opbeat.captureError(e, {extra: {job: fn.name}}))
  }
}
