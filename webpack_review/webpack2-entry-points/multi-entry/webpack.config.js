var path = require('path');
module.exports = {
    mode: 'development',
    entry: {
        main: ['./index.js', './test.js'],
        vender: ['./test2.js', './test3.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    }
}