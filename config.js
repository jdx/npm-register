'use strict'

let url = require('url')
let env = process.env

let config = {
  port: env.PORT || 3000,
  production: !!['production', 'staging'].find(e => e === env.NODE_ENV),
  timeout: env.TIMEOUT || 10000,
  uplink: url.parse(env.UPLINK || 'https://registry.npmjs.org'),
  redis: env.REDIS_URL,
  cloudfrontHost: env.CLOUDFRONT_HOST,
  cache: {
    packageTTL: parseInt(env.CACHE_PACKAGE_TTL) || 60,
    tarballTTL: parseInt(env.CACHE_TARBALL_TTL) || (6 * 60 * 60)
  },
  storage: env.NPM_REGISTER_STORAGE || 'fs',
  fs: {directory: env.NPM_REGISTER_FS_DIRECTORY},
  s3: {bucket: env.AWS_S3_BUCKET}
}

module.exports = config
