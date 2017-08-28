const opbeat = require('./opbeat')

module.exports = (err, extra = {}) => {
  opbeat.captureError(err, {
    level: 'warning',
    extra
  })
}
