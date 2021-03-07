var path = require('path');

module.exports = {
    // webapck3 是没有 mode 这个选项的
    // webapck4+ 的 mode 默认是 'production'
    mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
    entry: './main.js',
    output: {
        // 执行 webpack 命令后，打包编译生成 demo 的目录
        path: path.resolve(__dirname, 'dist'),
        // 出口文件名，和入口配置的名称对应，默认是 “main”
        filename: '[name].js',
        publicPath: '/xx'
    }
}