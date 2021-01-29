var path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist')
    },
    devServer: {
        port: 8080,
        publicPath: '/xuni',
        contentBase: 'public',
    }
}   
