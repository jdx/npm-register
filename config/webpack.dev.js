const path = require('path')

module.exports = {
  devServer: {
    historyApiFallback: true,
    contentBase: path.join(__dirname, '../public/'),
    stats: 'errors-only',
    host: 'localhost',
    port: '8080',
    compress: true,
    overlay: {
      errors: true,
      warnings: true
    },
    proxy: {
      '/': {
        target: 'http://localhost:3000',
        secure: false
      }
    }
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        loader: 'standard-loader',
        exclude: /(node_modules)/,
        options: {
          error: true,
          snazzy: true
        }
      }
    ]
  }
}
