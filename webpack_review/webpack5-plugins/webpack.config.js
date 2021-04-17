var ConsoleLogOnBuildWebpackPlugin = require('./ConsoleLogOnBuildWebpackPlugin');
module.exports = {
    mode: "development",
    entry: './index.js',
    output: {
        path: __dirname + '/dist',
        publicPath: '',
        filename: 'main.js'
    },
    plugins: [
        new ConsoleLogOnBuildWebpackPlugin(),
    ]
}