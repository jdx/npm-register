'use strict'

class Base {
  getJSON (key) {
    return this.get(key).then(raw => raw ? JSON.parse(raw) : undefined)
  }
  createPackageDetails (json) {
    if (json.name === '' || json.name === undefined) {
      return
    }
    let currentVersion = json['dist-tags'].latest || ''
    let author = json.versions[currentVersion].author || ''
    let tarball = json.versions[currentVersion].dist
    return {
      name: json.name || '',
      currentVersion: currentVersion,
      author: author,
      description: json.description || 'no description',
      tarball: tarball
    }
  }
}

module.exports = Base
