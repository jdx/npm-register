'use strict'

const path = require('path')
const config = require('../../config')

let Storage = require(path.join(__dirname, config.storage))
module.exports = new Storage()
