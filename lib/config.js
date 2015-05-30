'use strict';

let path = require('path');

function getenv (key) {
  let val = process.env[key];
  if (!val) {
    throw new Error(key + ' must be set');
  }
  return val;
}

module.exports = {
  tmp: path.join(__dirname, '..', 'tmp'),
  uplink: process.env.UPLINK || 'https://registry.npmjs.com',
  s3: {
    bucket: getenv('AWS_S3_BUCKET')
  }
};
