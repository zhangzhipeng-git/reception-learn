var webpack = require('webpack');
var configuration = require('./webpack.config');

var ConsoleLogOnBuildWebpackPlugin = require('./ConsoleLogOnBuildWebpackPlugin');

let compiler = webpack(configuration);

new webpack.ProgressPlugin().apply(compiler);
new ConsoleLogOnBuildWebpackPlugin().apply(compiler);