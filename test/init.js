'use strict'

const fs = require('fs-extra')

process.env.NPM_REGISTER_STORAGE = 'fs'
process.env.NPM_REGISTER_FS_DIRECTORY = 'tmp'

fs.outputFileSync('./tmp/htpasswd', 'test:$2y$05$ZhGKbrjyUbSbiMUeYeRUKOXPKzs9./NIZHsycrQkUKIj1Z2VybqdK\n')
