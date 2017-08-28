const r = module.exports = require('express').Router()
const aw = require('./asyncawait')
const {cacheKey} = require('../cache')
const redis = require('../redis')
const packages = require('../packages')
const AWS = require('aws-sdk')
const config = require('../config')
AWS.config.region = config.s3.region
const cf = new AWS.CloudFront()
const debug = require('debug')('invalidate')

function cfInvalidate (paths) {
  return new Promise((resolve, reject) => {
    cf.createInvalidation({
      DistributionId: config.cloudfrontID,
      InvalidationBatch: {
        CallerReference: (new Date()).toISOString(),
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    }, err => err ? reject(err) : resolve())
  })
}

function invalidatePackages (names) {
  function invalidatePackage (name) {
    let key = cacheKey(name)
    debug(`invalidating redis: %s`, name)
    let tasks = []
    tasks.push(redis.del(`${key}/etag`))
    tasks.push(redis.del(key))
    return Promise.all(tasks)
  }

  let tasks = names.map(invalidatePackage)
  return Promise.all(tasks)
}

// invalidates cache for a package and latest subdependencies
r.post('/-/invalidate/:name',
  aw(async function (req, res) {
    let {name} = req.params
    let dependents = await packages.fetchAllDependents(name)
    dependents.unshift(name)
    let tasks = []
    tasks.push(invalidatePackages(dependents))
    if (config.cloudfrontID) {
      let paths = dependents.map(d => `/${d}`)
      debug(`invalidating cloudfront paths: %o`, paths)
      tasks.push(cfInvalidate(paths))
    }
    await Promise.all(tasks)
    res.status(200).json({invalidated: dependents})
  }))
