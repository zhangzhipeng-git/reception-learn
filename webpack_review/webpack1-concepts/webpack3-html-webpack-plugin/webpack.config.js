// 测试 HtmlWebpackPlugin
var HtmlWebpackPlugin = require('html-webpack-plyarnugin');
var path = require('path');
module.exports = {
    mode: 'development',
    entry: {
        'main': './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [{ test: /\.txt$/, use: 'raw-loader' }],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
}