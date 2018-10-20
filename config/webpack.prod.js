const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: true
    })]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
}
