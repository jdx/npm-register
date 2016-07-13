'use strict'

let Redis = require('ioredis')
let config = require('../config')

let redis = new Redis(config.redis)

module.exports = redis
