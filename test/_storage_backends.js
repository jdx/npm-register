const storageBackends = [ 'fs' ]

if (process.env.AWS_SECRET_ACCESS_KEY) {
  storageBackends.push('s3')
}

if (process.env.GCS_BUCKET && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  storageBackends.push('gcs')
}

module.exports = storageBackends
