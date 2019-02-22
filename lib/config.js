'use strict'

let url = require('url')
let env = process.env
if (env.NODE_ENV === 'development') require('dotenv').config()

module.exports = {
  port: env.PORT || 3000,
  production: !!['production', 'staging'].find(e => e === env.NODE_ENV),
  timeout: parseInt(env.TIMEOUT) || 10000,
  uplink: url.parse(env.UPLINK || 'https://registry.npmjs.org'),
  redis: env.REDIS_URL,
  cloudfrontID: env.CLOUDFRONT_ID,
  cloudfrontHost: env.CLOUDFRONT_HOST,
  cache: {
    packageTTL: parseInt(env.CACHE_PACKAGE_TTL) || 60,
    tarballTTL: parseInt(env.CACHE_TARBALL_TTL) || (6 * 60 * 60)
  },
  fs: {directory: env.NPM_REGISTER_FS_DIRECTORY || 'tmp'},
  s3: {
    bucket: env.AWS_S3_BUCKET,
    region: env.AWS_DEFAULT_REGION,
    params: env.AWS_S3_PARAMS ? JSON.parse(env.AWS_S3_PARAMS) : {}
  },
  gcs: {
    bucket: env.GCS_BUCKET
  },
  npm: {
    basic: env.NPM_AUTH_BASIC,
    token: env.NPM_AUTH_TOKEN
  },
  auth: {
    write: (env.NPM_REGISTER_AUTH_WRITE || 'true') === 'true',
    read: (env.NPM_REGISTER_AUTH_READ || 'false') === 'true'
  },
  urlPrefix: env.NPM_REGISTER_URL_PREFIX || ''
}

let storageType = ((env.NPM_REGISTER_STORAGE && env.NPM_REGISTER_STORAGE.toLowerCase()) || 'fs')
let Storage = require('./storage/' + storageType)
module.exports.storage = new Storage()
