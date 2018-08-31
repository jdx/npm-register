'use strict'

class Base {
  getJSON (key) {
    return this.get(key).then(raw => raw ? JSON.parse(raw) : undefined)
  }
  createPackageDetails (json) {
    if (json.name === '' || json.name === undefined) {
      return
    }
    const currentVersion = json['dist-tags'].latest || ''
    const author = json.versions[currentVersion].author || ''
    const tarball = json.versions[currentVersion].dist

    return {
      name: json.name || '',
      currentVersion,
      author,
      description: json.description || 'no description',
      readme: json.readme || '',
      tarball
    }
  }
}

module.exports = Base
