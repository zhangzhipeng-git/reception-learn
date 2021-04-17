module.exports = [{
    output: {
      filename: './dist-amd.js',
      libraryTarget: 'amd'
    },
    name: 'amd',
    entry: './app.js',
    mode: 'development',
  }, {
    output: {
      filename: './dist-commonjs.js',
      libraryTarget: 'commonjs'
    },
    name: 'commonjs',
    entry: './app.js',
    mode: 'development',
  }];