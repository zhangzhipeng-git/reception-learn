var { CleanWebpackPlugin } = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: 'development',
    entry: {
        main: './index.js'
    },
    output: {
        path: __dirname + '/dist',
        chunkFilename: '[name].js',
        publicPath: '/dist/'
    },
    module: {
        rules: [
            // 处理 html 标签的 src 和 href
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader'
                }
            },
            // 处理 css 文件
            {
                test: /\.css$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].css',
                        // 覆盖 output 的 publicPath
                        publicPath: ['', '../dist', './'][~~(Math.random()*(2 - 0 + 1) + 0)]
                    }
                }]
            },
        ]
    },
    plugins: [
        // 清除打包目录
        new CleanWebpackPlugin(),
        // 引入打包的 chunk 并将 html 扔进打包目录
        new HtmlWebpackPlugin({
            template: './index.html',
            // 覆盖 output 的 publicPaht
            publicPath: ''
        })
    ]
}