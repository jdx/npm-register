'use strict'

class Base {
  get (key) {
    throw new Error('Not Implemented')
  }
  getJSON (key) {
    return this.get(key).then(raw => raw ? JSON.parse(raw) : undefined)
  }
}

module.exports = Base
