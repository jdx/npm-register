const Base = require('../lib/storage/base')
const expect = require('chai').expect

describe('storage', () => {
  describe('base storage methods', () => {
    let mockJson = {
      name: 'foo',
      'dist-tags': {
        latest: 1
      },
      versions: {
        1: {
          author: 'bar',
          dist: 'baz'
        }
      }
    }
    let base
    let packageDetails

    beforeEach(() => {
      base = new Base()
    })

    afterEach(() => {
      mockJson.name = 'foo'
      mockJson['dist-tags'].latest = 1
    })

    it('should escape if name property is undefined or empty string', () => {
      mockJson.name = ''
      expect(base).to.be.an.instanceof(Base)
      expect(base.createPackageDetails(mockJson)).to.be.an('undefined')
    })

    it('should return a package object', () => {
      packageDetails = base.createPackageDetails(mockJson)
      expect(base).to.be.an.instanceof(Base)
      expect(packageDetails).to.be.an('object')
      expect(packageDetails.name).to.equal('foo')
      expect(packageDetails.currentVersion).to.equal(1)
      expect(packageDetails.author).to.equal('bar')
      expect(packageDetails.tarball).to.equal('baz')
    })

    it('should return an empty string if latest is null', () => {
      delete mockJson['dist-tags'].latest
      packageDetails = base.createPackageDetails(mockJson)
      expect(base).to.be.an.instanceof(Base)
      expect(packageDetails.currentVersion).to.equal('')
    })
  })
})
