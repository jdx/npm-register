const app = require('../lib/server')
const npm = require('../lib/npm')
const expect = require('chai').expect
const sinon = require('sinon')
const request = require('supertest').agent(app.listen())
const config = require('../lib/config')

describe('audit', () => {
  describe('POST /-/npm/v1/security/audits', () => {
    const testResponse = {hello: ['earth', 'mars'], number: 1}
    beforeEach(function () {
      config.auth.write = false
      sinon.stub(npm, 'post').returns(testResponse)
    })
    afterEach(() => {
      config.auth.write = true
      npm.post.restore()
    })

    it('forwards requests to upstream', async () => {
      const testRequest = {foo: 'bar', baz: 2}
      await request.post('/-/npm/v1/security/audits').send(testRequest)

      expect(npm.post.calledOnce).to.equal(true)
      expect(npm.post.firstCall.args).to.eql(['/-/npm/v1/security/audits', testRequest])
    })

    it('forwards responses from upstream', async () => {
      await request.post('/-/npm/v1/security/audits').expect(200, testResponse)
    })
  })
})
