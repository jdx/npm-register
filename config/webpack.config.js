const path = require('path')
const merge = require('webpack-merge')

const devConfig = require('./webpack.dev')
const prodConfig = require('./webpack.prod')

const PATHS = {
  app: path.join(__dirname, '../client'),
  public: path.join(__dirname, '../public')
}

const baseConfig = {
  entry: {
    app: PATHS.app + '/index.jsx'
  },
  output: {
    path: PATHS.public,
    filename: 'app.js'
  },
  module: {
    rules: [{
      test: /\.jsx$/,
      exclude: /(node_modules|lib)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['react']
        }
      }
    }, {
      test: /\.(png|jpg|gif)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192
        }
      }]
    }, {
      test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader',
      options: {
        limit: 50000,
        mimetype: 'application/font-woff',
        name: './fonts/[name].[ext]'
      }
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  }
}

module.exports = (env) => {
  if (env === 'production') {
    return merge(baseConfig, prodConfig)
  }

  return merge(baseConfig, devConfig)
}
