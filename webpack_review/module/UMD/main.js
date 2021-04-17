// ./main.js

// UMD
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        console.log('main', 'AMD');
        // AMD，定义一个以文件名为模块名的模块，并导入 vue 对应的依赖
        define(['./test'], factory);
    } else if (typeof exports === 'object') {
        console.log('main', 'CommonJS');
        // CommonJS
        module.exports = factory(require('./test'));
    } else {
        console.log('main', 'Root');
        // 浏览器全局变量(root 即 window)
        root.yyy= factory(root.test);
    }
}(this, function(a) {
    console.log(a);
}));