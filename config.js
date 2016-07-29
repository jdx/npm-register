'use strict'

let path = require('path')
let url = require('url')
let env = process.env
let config = {}

function getenv (key) {
  let val = env[key]
  if (!val) {
    throw new Error(key + ' must be set')
  }
  return val
}

function getProvider(storageModule, config, env) {
    try {
        if (require.resolve(storageModule)) {
            return require(storageModule)(config, env);
        }
    } catch (e) {
        console.error("The Storage Module was not found", e);
        process.exit(e.code);
    }
}

config = {
    tmp: path.normalize(path.join(__dirname, '/../tmp')),
    port: env.PORT || 3000,
    production: !!['production', 'staging'].find((e) => e === env.NODE_ENV),
    timeout: env.TIMEOUT || 10000,
    uplink: url.parse(env.UPLINK || 'https://registry.npmjs.org'),
    redis: env.REDIS_URL,
    cloudfrontHost: env.CLOUDFRONT_HOST,
    // directory: path.join(__dirname,"/npm"),  
    s3: {
        key: getenv('AWS_ACCESS_KEY_ID'),
        secret: getenv('AWS_SECRET_ACCESS_KEY'),
        bucket: getenv('AWS_S3_BUCKET')
    },
    cache: {
        packageTTL: parseInt(env.CACHE_PACKAGE_TTL) || 60,
        tarballTTL: parseInt(env.CACHE_TARBALL_TTL) || (6 * 60 * 60)
    }
}
config.storage = getProvider("alphonso-s3", config, env); // or you can use alphonso-fs, but remember to uncomment the directory value in the config

module.exports = config