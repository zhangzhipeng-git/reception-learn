// 单入口

var path = require('path');
module.exports = {
    mode: 'development',
    entry: {
        'bundle': './src/single.js'
    },
    // 也可写写成下面两种
    // entry: './src/single.js',
    // entry: ['./src/single.js'],
    output: {
        // 执行 webpack 命令后，打包编译生成 demo 的目录
        path: path.resolve(__dirname, 'dist'),
        // 出口文件名，和入口配置的名称对应，默认是 “main”
        filename: '[name].js'
    }
}