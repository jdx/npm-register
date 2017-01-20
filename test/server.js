'use strict'
/* global beforeEach */

const config = require('../config')
const defaultAuth = config.auth

beforeEach(() => {
  config.auth = Object.assign({}, defaultAuth)
})

process.env.PORT = '7129'
require('../server').listen(process.env.PORT)
