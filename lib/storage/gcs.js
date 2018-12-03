'use strict'

const { Storage } = require('@google-cloud/storage')
const config = require('../config')
const Promise = require('bluebird')
const Stream = require('stream')
const storage = new Storage()
const bucket = storage.bucket(config.gcs.bucket)

class GCS extends require('./base') {
  constructor () {
    super()
    console.log(`Saving files to GCS bucket ${config.gcs.bucket}`)
  }

  get (Key) {
    return new Promise((resolve, reject) => {
      const options = {}
      bucket
        .file(Key)
        .download(options, (err, contents) => {
          if (err) {
            resolve()
          } else {
            resolve(contents)
          }
        })
    })
  }

  getAllPackageInfo (prefix) {
    return new Promise((resolve, reject) => {
      bucket.getFiles({ prefix }, (err, dirs) => {
        if (err) {
          throw err
        }
        let files = dirs.map(file => {
          return file.download()
            .then(contents => {
              let data = contents[0].toString('utf-8')
              let json = JSON.parse(data)
              let packageDetails = super.createPackageDetails(json)
              return packageDetails
            })
        })
        Promise.all(files).then(values => {
          resolve(values.filter(v => v))
        })
      })
    })
  }

  put (Key, data, options) {
    let saveOptions = { }
    if (options && typeof (options['content-type']) !== 'undefined') {
      saveOptions.contentType = options['content-type']
    } else if (options && typeof (options['contentType']) !== 'undefined') {
      saveOptions.contentType = options['contentType']
    }
    // console.log(`Uploading ${Key} to GCS`)
    if (data instanceof Stream) {
      const writeStream = bucket
        .file(Key)
        .createWriteStream(saveOptions)
      return new Promise((resolve, reject) => {
        writeStream
          .on('error', (err) => {
            reject(err)
          })
          .on('finish', () => {
            resolve()
          })
        data.pipe(writeStream)
      })
    } else if (data instanceof Object) {
      data = JSON.stringify(data)
      saveOptions.contentType = 'application/json'
    }
    return bucket.file(Key).save(data, saveOptions)
  }

  stream (Key) {
    // console.log(`Fetching ${Key} from GCS`)
    const file = bucket.file(Key)
    return file.getMetadata()
      .then(data => {
        return {
          size: data[0].size,
          stream: file.createReadStream()
        }
      })
      .catch(err => {
        if (err.code !== 404) {
          throw err
        }
      })
  }

  delete (Key) {
    return bucket.file(Key).delete()
  }

  list (prefix) {
    return bucket.getFiles({ prefix })
      .then(resp => {
        if (resp.length === 0) {
          return []
        }
        const files = resp[0]
        if (!files || files.length === 0 || typeof (files[0]) === 'undefined') {
          return []
        }
        return files.map(file => {
          return file.name
        })
      })
  }
}

module.exports = GCS
