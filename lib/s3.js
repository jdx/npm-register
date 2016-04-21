'use strict'

let Promise = require('bluebird')
let config = require('./config')
let util = require('./util')

let s3 = require('knox').createClient(config.s3)
s3 = Promise.promisifyAll(s3)

function stream (key) {
  return s3.getFileAsync(key)
    .then(function (res) {
      if (res.statusCode === 404) {
        return
      }
      if (res.statusCode !== 200) {
        util.concat(res)
          .then(function (err) {
            throw new Error('Error downloading ' + key + '\n' + err)
          })
      }
      return res
    })
}

function download (key) {
  return stream(key)
    .then(function (res) {
      if (!res) return
      return util.concat(res)
    })
}

module.exports = s3
module.exports.stream = stream
module.exports.download = download
