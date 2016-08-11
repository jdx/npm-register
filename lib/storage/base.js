'use strict'

class Base {
  getJSON (key) {
    return this.get(key).then(raw => raw ? JSON.parse(raw) : undefined)
  }
}

module.exports = Base
