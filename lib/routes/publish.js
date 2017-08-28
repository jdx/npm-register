const r = module.exports = require('express').Router()
const aw = require('./asyncawait')
const crypto = require('crypto')
const path = require('path')
const middleware = require('../middleware')
const packages = require('../packages')
const config = require('../config')
const bodyParser = require('body-parser')

// npm publish
r.put('/:name',
  middleware.auth.write,
  bodyParser.json({limit: '100mb'}),
  aw(async function (req, res) {
    let pkg = req.body
    let tags = Object.keys(pkg['dist-tags'])
    if (tags.length !== 1) {
      res.status(400).json({error: 'must have 1 dist-tag'})
      return
    }
    let tag = tags[0]
    let existing = await packages.get(pkg.name)
    if (existing !== 404) {
      if (Object.keys(existing.versions).find(v => v === pkg['dist-tags'][tag])) {
        res.status(409).json({error: 'version already exists'})
        return
      }
      pkg.versions = Object.assign(existing.versions, pkg.versions)
      pkg['dist-tags'] = Object.assign(existing['dist-tags'], pkg['dist-tags'])
    }
    pkg.etag = Math.random().toString()
    let attachments = pkg._attachments
    delete pkg._attachments
    for (let filename of Object.keys(attachments)) {
      let attachment = attachments[filename]
      let data = Buffer.from(JSON.stringify(attachment.data), 'base64')

      let hash = crypto.createHash('sha1')
      hash.update(data)
      let sha = hash.digest('hex')
      let ext = path.extname(filename)
      filename = path.basename(filename, ext)

      await config.storage.put(`tarballs/${pkg.name}/${filename}/${sha}${ext}`, data, {
        'Content-Type': attachment.content_type,
        'Content-Length': attachment.length
      })
    }
    await packages.save(pkg)
    res.status(200).json(await packages.get(pkg.name))
  }))
