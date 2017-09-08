module.exports = {
  devServer: {
    historyApiFallback: true,
    stats: 'errors-only',
    host: 'localhost', // Defaults to `localhost`
    port: '8080', // Defaults to 8080
    overlay: {
      errors: true,
      warnings: true
    },
    proxy: {
      '/api': {
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
