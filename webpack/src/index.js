console.log('hello zfpx。。。。。。');
console.log(module.hot)

require('@babel/polyfill');

console.log('aaa'.includes('a'));

// require('./index.css'); 
// require('./a.css'); 
let a = () => {
    console.log('es6')
}
@log
class A { // ts vscode插件提示报错，settings -> extensions -> typescript -> 勾上选项enable/disable javascript experimentalDecorators
    a = 1;
}
var b = new A();
function log(c) {
    console.log(c)
}

function * d() {
    yield 1;
    
};
async function e() {
    await new Promise((resolve, reject) => {
        setTimeout(() => {resolve();console.log('wait me')}, 2000);
    })
    console.log('shshshsh')
}
e();
// console.log(d().next());

// 看来babel也是不错的。。。


// require('./8.js');
// require('./9.js');

// 测试dllPlugin
import React from 'react';
import ReactDOM from 'react-dom';
ReactDOM.render(<h1>JSX</h1>, window.root);
import str from './8.js';
console.log(module.hot)
  if (module.hot) {
    module.hot.accept('./8.js', () => {
      console.log('文件更新了'); 
      // 重新执行该文件
    //   require('./a.js');
    }) 
  }