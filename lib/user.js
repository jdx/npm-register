const htpasswd = require('htpasswd-auth')
const uuid = require('node-uuid')
const config = require('./config')

async function getCreds () {
  return (await config.storage.getJSON('auth_tokens')) || {}
}

async function createAuthToken (username) {
  let creds = await getCreds()
  let token = uuid.v4()
  creds[token] = {
    username,
    timestamp: new Date()
  }
  await config.storage.put('auth_tokens', creds, {
    'Content-Type': 'application/json'
  })
  return token
}

class Auth {
  static async authenticate (user) {
    let creds = (await config.storage.get('htpasswd')) || ''
    let auth = await htpasswd.authenticate(user.name, user.password, creds.toString())
    if (!auth) return false
    return createAuthToken(user.name)
  }

  static async findByToken (token) {
    let creds = await getCreds()
    if (creds[token]) return creds[token].username
  }
}
module.exports = Auth
