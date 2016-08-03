'use strict'

const AWS = require('aws-sdk')
const config = require('../../config')
const Promise = require('bluebird')
const Stream = require('stream')

class S3 extends require('./base') {
  constructor () {
    super()
    this.client = Promise.promisifyAll(require('s3').createClient({
      s3Client: Promise.promisifyAll(new AWS.S3())
    }))
  }

  get (key) {
    return new Promise((resolve, reject) => {
      this.client.downloadBuffer(this._params(key))
      .on('error', () => resolve())
      .on('end', resolve)
    })
  }

  put (key, data) {
    let params = this._params(key, {Body: data})
    if (data instanceof Stream) {
    } else if (data instanceof Object) {
      params.Body = JSON.stringify(params.Body)
      params.ContentType = 'application/json'
    }
    return this.client.s3.uploadAsync(params)
  }

  stream (key) {
    return this.client.s3.headObjectAsync(this._params(key))
    .then(obj => {
      return {
        size: obj.ContentLength,
        stream: this.client.downloadStream(this._params(key))
      }
    })
    .catch(err => { if (err.code !== 'NotFound') throw err })
  }

  delete (key) {
    return this.client.s3.deleteObjectAsync(this._params(key))
  }

  list (prefix) {
    return this.client.s3.listObjectsAsync({
      Bucket: config.s3.bucket,
      Prefix: prefix
    }).then(dirs => {
      return dirs.Contents.map(c => c.Key)
    })
  }

  _params (key, opts) {
    return Object.assign({
      Bucket: config.s3.bucket,
      Key: key
    }, opts)
  }
}

module.exports = S3
