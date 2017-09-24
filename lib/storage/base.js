'use strict'

class Base {
  getJSON (key) {
    return this.get(key).then(raw => raw ? JSON.parse(raw) : undefined)
  }
  createPackageDetails (json) {
    if (json.name === '' || json.name === undefined) {
      return
    }
    let currentVersion = json['dist-tags'].latest || null
    let author = json.versions[currentVersion].author || null
    let tarball = json.versions[currentVersion].dist

    return {
      name: json.name || null,
      currentVersion: currentVersion,
      author: author,
      description: json.description || 'no description',
      readme: json.readme || null,
      tarball: tarball
    }
  }
}

module.exports = Base
