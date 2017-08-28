const redis = require('../lib/redis')
const {expect} = require('chai')

beforeEach(async function () {
  if (!redis) return this.skip()
  await redis.del('teststring')
})

describe('redis', () => {
  it('zget nothing', async function () {
    let value = await redis.zget('teststring')
    expect(value).to.equal(null)
  })

  it('zset', async function () {
    await redis.zset('teststring', 'foobar')
    expect(await redis.get('teststring')).not.to.equal('foobar')
    expect(await redis.zget('teststring')).to.equal('foobar')
  })

  it('zsetex', async function () {
    await redis.zsetex('teststring', 100, 'foobar')
    expect(await redis.zget('teststring')).to.equal('foobar')
  })
})
