const {promisify} = require('util')
const zlib = require('zlib')
const inflate = promisify(zlib.inflate)
const deflate = promisify(zlib.deflate)

class GZip {
  static async inflate (compressed) {
    if (!compressed) return compressed
    let buffer = Buffer.from(compressed, 'base64')
    let value = await inflate(buffer)
    return value.toString()
  }

  static async deflate (value) {
    let compressed = await deflate(value)
    return compressed.toString('base64')
  }
}

module.exports = GZip
