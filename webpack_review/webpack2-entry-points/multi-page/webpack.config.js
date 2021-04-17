var path = require('path');
// 脚本自动插入 html 文件插件
var HtmlWebpackPlugin = require('html-webpack-plugin');
// 清理打包目录插件
var {CleanWebpackPlugin} = require('clean-webpack-plugin');
module.exports = {
    mode: 'development',
    entry: {
        page1: './src1/test1.js',
        page2: './src2/test2.js',
        page3: './src3/test3.js',
    },
    output: {
        path:path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    plugins: [
        // 清理打包目录
        new CleanWebpackPlugin(),
        // 页面 1
        new HtmlWebpackPlugin({
            template: './index1.html',
            filename: 'page1.html',
            chunks: ['page1'],
            minify:false
        }),
        // 页面 2
        new HtmlWebpackPlugin({
            template: './index2.html',
            filename: 'page2.html',
            chunks: ['page2'],
            minify:false
        }),
        // 页面 3
        new HtmlWebpackPlugin({
            template: './index3.html',
            filename: 'page3.html',
            chunks: ['page3'],
            minify:false
        }),
    ]
}