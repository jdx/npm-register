const config = require('../lib/config')
const defaultAuth = config.auth

beforeEach(() => {
  config.auth = {...defaultAuth}
})

process.env.PORT = '7129'
require('../lib/server').listen(process.env.PORT)
