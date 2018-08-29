const config = require('../lib/config')
const npm = require('../lib/npm')
const {HTTP} = require('http-call')
const expect = require('chai').expect
const sinon = require('sinon')

describe('npm', () => {
  const body = '{"hello": 42}'

  describe('post', () => {
    beforeEach(function () {
      this.response = {body}
      sinon.stub(HTTP, 'post').resolves(this.response)
    })

    afterEach(function () {
      HTTP.post.restore()
    })

    it('sets Basic auth header if present', async () => {
      config.npm.basic = 'http_basic_auth'
      await npm.post('/mocha', '')
      const { headers } = HTTP.post.lastCall.args[1]
      expect(headers['Authorization']).to.equal(`Basic ${config.npm.basic}`)
    })

    it('constructs uplink URL correctly', async () => {
      await npm.post('/mocha', '')
      const url = HTTP.post.lastCall.args[0]
      expect(url).to.equal(config.uplink.href + 'mocha')
    })

    it('returns body of response', async () => {
      const response = await npm.post('/', '')
      expect(response).to.equal(body)
    })
  })
})
