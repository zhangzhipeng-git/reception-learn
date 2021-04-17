var {CleanWebpackPlugin} = require('clean-webpack-plugin');
module.exports = {
    mode: 'development',
    entry: {
        entry1: ['./index1.js', './index2.js'],
        entry2: ['./index3.js', './index4.js']
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/dist/'
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
}