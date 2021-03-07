// ./test.js

// 这种方式起不到任何作用，它也不会被挂载到 global 上..
exports = {a:1};
console.log(module.exports) // {}

exports.a = 2;
console.log(module.exports) // { a: 2 }

module.exports = {a:3};
console.log(module.exports); // { a: 2 }

b = '我是所有模块共享的变量'
console.log(global.b) // 我是所有模块共享的变量

exports = {a:1}; // 它不会被挂载到 global 上
console.log(global.exports); // undefined