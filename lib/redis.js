'use strict';

let Redis  = require('ioredis');
let config = require('./config');

console.log('connecting to redis', config.redis);
let redis = new Redis(config.redis);

module.exports = redis;
