'use strict'

const config = require('./config')

if (config.redis) {
  const Redis = require('ioredis')
  module.exports = new Redis(config.redis)
} else {
  module.exports = null
}
