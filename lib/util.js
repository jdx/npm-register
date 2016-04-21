'use strict'

let Bluebird = require('bluebird')
let fs = Bluebird.promisifyAll(require('fs'))
let path = require('path')

function concat (stream) {
  return new Bluebird(function (fulfill, reject) {
    let strings = []
    stream.setEncoding('utf8')
    stream.on('error', reject)
    stream.on('data', function (data) {
      strings.push(data)
    })
    stream.on('end', function () {
      fulfill(strings.join(''))
    })
  })
}

function mkdirp (dir) {
  return fs.accessAsync(dir)
    .catch(function () {
      return mkdirp(path.dirname(dir))
        .then(function () {
          return fs.mkdirAsync(dir)
        })
    })
}

exports.concat = concat
exports.mkdirp = mkdirp
