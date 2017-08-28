let app = require('../lib/server')
let request = require('supertest').agent(app.listen())

describe('invalidate', () => {
  // TODO: test this functionality. right now this is just executing
  describe('POST /-/invalidate/array-union', () => {
    it('does not fail', async () => {
      await request.post('/-/invalidate/array-union').expect(200)
    })
  })
})
