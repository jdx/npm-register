const config = require('./config')

function redis () {
  const gzip = require('./gzip')
  const Redis = require('ioredis')
  const redis = new Redis(config.redis)

  redis.zget = async key => {
    let compressed = await redis.get(key)
    return gzip.inflate(compressed)
  }

  redis.zset = async (key, value) => {
    let compressed = await gzip.deflate(value)
    return redis.set(key, compressed)
  }

  redis.zsetex = async (key, timeout, value) => {
    let compressed = await gzip.deflate(value)
    return redis.setex(key, timeout, compressed)
  }

  return redis
}

module.exports = config.redis ? redis() : null
