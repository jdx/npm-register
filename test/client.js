const app = require('../lib/server')
const request = require('supertest').agent(app.listen())

describe('client route', () => {
  describe('GET /-/api/v1/packages', () => {
    it('should return a 200 response', async () => {
      await request.get('/-/api/v1/packages').expect(200)
    })
    it('should return a json response', async () => {
      await request.get('/-/api/v1/packages')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
    })
  })
})
