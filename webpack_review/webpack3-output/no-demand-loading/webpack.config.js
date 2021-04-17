var {CleanWebpackPlugin} = require('clean-webpack-plugin');
module.exports = {
    mode: 'development',
    entry: {
        main: './index.js'
    },
    output: {
        path: __dirname + '/dist',
        chunkFilename: '[name].[chunkhash].js'
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
}