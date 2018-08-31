'use strict'

const AWS = require('aws-sdk')
const config = require('../config')
const Promise = require('bluebird')
const Stream = require('stream')
AWS.config.region = config.s3.region

class S3 extends require('./base') {
  constructor () {
    super()
    var settings = config.s3.params
    settings.params = {}
    settings.params.Bucket = config.s3.bucket

    this.client = Promise.promisifyAll(require('s3').createClient({
      s3Client: Promise.promisifyAll(new AWS.S3(settings))
    }))
    console.log(`Saving files to s3 bucket ${config.s3.bucket}`)
  }

  get (Key) {
    return new Promise((resolve, reject) => {
      this.client.downloadBuffer({ Key })
        .on('error', () => resolve())
        .on('end', resolve)
    })
  }

  getAllPackageInfo (prefix) {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: config.s3.bucket,
        Prefix: prefix
      }
      this.client.s3.listObjectsAsync(params)
        .then(dirs => {
          let files = dirs.Contents.map((c) => {
            return this.client.s3.getObjectAsync({
              Bucket: params.Bucket,
              Key: c.Key
            }).then(item => {
              let json = JSON.parse(item.Body.toString('utf-8'))
              let packageDetails = super.createPackageDetails(json)
              return packageDetails
            })
          })
          Promise.all(files).then(values => {
            resolve(values)
          })
        })
    })
  }

  put (Key, data) {
    let params = { Key }
    if (data instanceof Stream || data instanceof Buffer) {
      params.Body = data
    } else if (data instanceof Object) {
      params.Body = JSON.stringify(data)
      params.ContentType = 'application/json'
    }
    console.log(`Uploading ${Key} to s3`)
    return this.client.s3.uploadAsync(params)
  }

  stream (Key) {
    console.log(`Fetching ${Key} from s3`)
    return this.client.s3.headObjectAsync({ Key })
      .then(obj => {
        return {
          size: obj.ContentLength,
          stream: this.client.downloadStream({ Key })
        }
      })
      .catch(err => { if (err.code !== 'NotFound') throw err })
  }

  delete (Key) {
    return this.client.s3.deleteObjectAsync({ Key })
  }

  list (prefix) {
    return this.client.s3.listObjectsAsync({
      Bucket: config.s3.bucket,
      Prefix: prefix
    }).then(dirs => {
      return dirs.Contents.map(c => c.Key)
    })
  }
}

module.exports = S3
