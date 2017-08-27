'use strict'

const metric = require('metric-log')
const onFinished = require('on-finished')

module.exports = (req, res, next) => {
  this.metric = metric.context({request_id: req.headers['x-request-id'] || Math.random()})
  let end = this.metric.profile('request')
  onFinished(res, (err, res) => {
    if (err) console.error(err)
    end({
      method: req.method,
      'user-agent': req.headers['user-agent'],
      status: res.statusCode,
      path: req.path
    })
  })
  next()
}
