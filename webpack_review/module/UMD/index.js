// UMD
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD，定义一个以文件名为模块名的模块，并导入 vue 对应的依赖
        define(['vue'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('vue'));
    } else {
        // 浏览器全局变量(root 即 window)
        root.yyy= factory(root.Vue);
    }
}(this, function(a) {
    console.log(a);
}));