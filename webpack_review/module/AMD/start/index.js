// 定义一个模块，实际上也可以依赖其他模块的，这里不做研究
// define({ a: 1, b: 2, c: 3 });

// 还可以这么写
define(function(require, exports, module) {
    // 可以这么写
    // return {a: 1, b: 2, c: 3};
    // 也可以这么些
    // exports.a = 1;
    // exports.b = 2;
    // exports.c = 3;
    module.exports = {a: 1, b: 2, c: 3};
});