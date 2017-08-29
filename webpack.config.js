var webpack = require("webpack")

module.exports = {
  entry: "./src/alekhine.js",

  output: {
    filename: "dist/alekhine.js",
    sourceMapFilename: "dist/alekhine.map",
    libraryTarget: "commonjs2"
  },

  devtool: "#source-map",

  module: {
    rules: [{
      test: /\.js$/,
      loader: "babel-loader"
    }]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      warnings: true,
      mangle: true
    })
  ]
}
