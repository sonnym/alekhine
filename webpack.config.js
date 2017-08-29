module.exports = {
  entry: "./src/alekhine.js",

  output: {
    filename: "dist/alekhine.js",
    sourceMapFilename: "dist/alekhine.map",
    libraryTarget: "commonjs2"
  },

	devtool: "#source-map"
}