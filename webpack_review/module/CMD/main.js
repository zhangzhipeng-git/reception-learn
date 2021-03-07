// ./main.js

// webpack 不会“干掉”这段代码
// seajs 的全局配置
seajs.config({
    // 配置加载 JS 的基础路径
    base: './start',
    // 别名
    alias: {
        'app': 'app'
    },
    charset: 'utf-8',
    timeout: 20000,
    debug: false
});

// 定义个模块，模块标识由文件名决定
define(function(require, exports, module) {
    /**
     * 引入 app 模块，如果使用 var a = require('app'),
     * sea.js 支持这种写法， 但是 webpack 不支持，它会因
     * 为找不到模块而报错,其原因和用 webpack 编译 AMD 模
     * 块化代码一样，需要换为路径才能解析成功。
     */
    var a = require('./start/app');
    // 也可以写成
    // exports.desc = 'entry module';
    // exports.data = a;
    // 也可以写成
    // module.exports = {desc: 'entry module', data: a};
    return {
        desc: 'entry module',
        data: a
    }
});