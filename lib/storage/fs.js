const config = require('../config')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const Stream = require('stream')
const klaw = require('klaw')

class FS extends require('./base') {
  constructor () {
    super()
    this.directory = path.resolve(config.fs.directory)
    console.error(`Saving files to local filesystem at ${this.directory}`)
    if (!config.fs.directory) console.error('Set NPM_REGISTER_FS_DIRECTORY to change directory')
  }

  get (key) {
    return fs.readFileAsync(this._genpath(key), 'utf8')
    .catch(err => {
      if (err.code !== 'ENOENT') throw err
    })
  }

  stream (key) {
    let file = this._genpath(key)
    return fs.statAsync(file)
    .then(info => {
      return {
        stream: fs.createReadStream(file),
        size: info.size
      }
    }).catch(err => {
      if (err.code !== 'ENOENT') throw err
    })
  }

  put (key, data) {
    let file = this._genpath(key)
    console.log(`Writing ${file}`)
    fs.mkdirpSync(path.dirname(file))
    if (data instanceof Stream) {
      return new Promise((resolve, reject) => {
        let output = fs.createWriteStream(file)
        output.on('error', reject)
        data.pipe(output)
        data.on('error', reject)
        output.on('finish', resolve)
      })
    } else if (data instanceof Buffer) {
      return fs.outputFileAsync(file, data)
    } else {
      data = JSON.stringify(data)
      return fs.outputFileAsync(file, data)
    }
  }

  delete (key) {
    let file = this._genpath(key)
    return fs.unlinkAsync(file)
  }

  list (prefix) {
    let file = this._genpath(prefix)
    console.log(file)
    return new Promise((resolve, reject) => {
      let items = []
      klaw(file)
      .on('data', item => {
        if (!item.stats.isDirectory()) {
          items.push(item.path.replace(this.directory, ''))
        }
      })
      .on('error', err => {
        if (err.code === 'ENOENT') resolve([])
        else reject(err)
      })
      .on('end', () => resolve(items))
    })
  }

  _genpath (key) {
    return path.join(this.directory, key)
  }
}

module.exports = FS
