/**
 * webpack 不支持 require.config，
 * 这部分代码编译后为 undefined
 */

/**
 * 配置模块加载位置，
 * Require.js 根据路径去加载对应的 JS，
 * 一般是引入第三方 JS 时使用
 */
require.config({
    paths: {
        index: './start/index'
    }
});

/**
 * 这种方式 webpack 可以识别，不过文件需存在
 * 
 * 第1种方式：根据 JS 文件路径去加载JS，
 * 等 index 对应的 JS 加载并执行完后就执行 callback
 */
require(['./start/index'], function(index) {
    console.log('index2', index);
});

/**
 * 如果不是以别名或 '/', './' 开头，
 * webpack 会使用 nodejs 的 require 方式
 * 从 node_modules 一层层的网上找，找不到
 * 则报错。所以 wepack 和 require.js 的
 * 处理方式不一致，webpack 会因为找不到对
 * 应的模块而报错。
 */

/**
 * 第2种方式：根据 id 去加载JS，
 * 等 index 对应的 JS 加载并执行完后就执行 callback
 */
require(['index'],function(index){
    console.log('index1', index);
});

/**
 * 等本文件定义的 uitl1 模块执行完后，调用 callback
 */
require(['util1'],function(util){
    console.log('util1', util);
});

/**
 * 等定义的 uitl2 模块执行完后，调用 callback
 */
require(['util2'],function(util){
    console.log('util2', util);
});

/**
 * webpack 编译后的代码只能导出最后一个，
 * 它默认一个文件只能有一个 define ，即
 * 一个文件一个模块。
 */

/**
 * 同一文件中定义一个 util1 模块
 */
define('util1', function() {
    return {desc: 'util1'};
});

/**
 * 同一文件中定义一个 util2 模块
 */
define('util2', function() {
    return {desc: 'util2'};
});
