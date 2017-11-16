let app = require('../lib/server')
let request = require('supertest').agent(app.listen())
let redis = require('../lib/redis')
let config = require('../lib/config')

describe('invalidate', () => {
  // TODO: test this functionality. right now this is just executing
  describe('POST /-/invalidate/array-union', () => {
    beforeEach(async function () {
      if (!redis) return this.skip()
      config.auth.write = false
    })
    afterEach(() => {
      config.auth.write = true
    })
    it('does not fail', async () => {
      await request.post('/-/invalidate/array-union').expect(200)
    })
  })
})
