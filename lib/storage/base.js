'use strict'
const _ = require('lodash')

class Base {
  getJSON (key) {
    return this.get(key).then(raw => raw ? JSON.parse(raw) : undefined)
  }
  createPackageDetails (json) {
    if (json.name === '' || json.name === undefined) {
      return
    }
    const currentVersion = _.get(json, ['dist-tags', 'latest'], '')
    const author = _.get(json, ['versions', currentVersion, 'author'], '')
    const tarball = _.get(json, ['versions', currentVersion, 'dist'])

    return {
      name: _.get(json, 'name'),
      currentVersion,
      author,
      description: _.get(json, 'description', 'no description'),
      readme: _.get(json, 'readme'),
      tarball
    }
  }
}

module.exports = Base
