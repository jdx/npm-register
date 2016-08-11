'use strict'

process.env.NPM_REGISTER_FS_DIRECTORY = 'tmp'
const fs = require('fs-extra')
if (!fs.existsSync('./tmp/htpasswd')) {
  fs.outputFileSync('./tmp/htpasswd', 'test:$2y$05$ZhGKbrjyUbSbiMUeYeRUKOXPKzs9./NIZHsycrQkUKIj1Z2VybqdK\n')
}
