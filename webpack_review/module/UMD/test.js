// ./test.js

// UMD
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        console.log('test', 'AMD');
        // AMD，定义一个以文件名为模块名的模块，并导入 vue 对应的依赖
        define(factory);
    } else if (typeof exports === 'object') {
        console.log('test', 'CommonJS');
        // CommonJS
        module.exports = factory();
    } else {
        console.log('test', 'Root');
        // 浏览器全局变量(root 即 window)
        root.test= factory();
    }
}(this, function() {
    console.log('test');
    return {
        desc: 'test'
    }
}));