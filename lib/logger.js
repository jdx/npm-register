'use strict'

const metric = require('metric-log')

module.exports = function * (next) {
  this.metric = metric.context({request_id: this.request.headers['x-request-id'] || Math.random()})
  let end = this.metric.profile('request')
  yield next
  end({method: this.request.method, 'user-agent': this.request.headers['user-agent'], status: this.response.status, path: this.request.path})
}
