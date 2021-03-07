// test1.js

// 将 a 、b 和 default 变为 Module 实例的属性，并导出 Module 实例
export var a = { a: 1 }
export var b = { b: 2 };
export default { desc: '我是默认导出' };

// 以上导出相当于下面这一句, 不过这里 default 是关键字，会有错误，
// 所以这里的花括号并不是对象！它只是一种表示形式，类似于 Module 实例的属性集合。
// export { a, b , default }