# 相关小知识

## 纯对象

纯对象调用 toString 方法（该方法没有被重写），结果是：[object Object]。例如，通过 new Object() 或者 {} 创建的对象等都是纯对象。

+ new Date()
+ new Function()
+ new String()
+ new Number()
+ new Boolean()
+ new Array()  

以上都不是纯对象。

## 生成重复字符串

``` js
/**
 * 从 n 的二进制低位向高位遍历
 * 如重复 a 字符 13 次
 * 
 * 二进制位：| 1 | 1 | 0 | 1 |
 * 进制基数：| 8 | 4 | 2 | 1 |
 * 中间结果：|8*a|4*a|   |1*a|
 * 
 * res = 8*a + 4*a + 1*a
 * 
 * 假设要重复 n 次，设循环次数为 x ，则 2^x = n;
 * 则循环次数 = log 以 2 为底 n 的对数，即时间复杂度简写为 O(logn)
 */
const repeat = (str, n) => {
    // 第一位时，中间结果为 str
    let res = '';
    while (n) {
        // 如果当前位不为 0，则结果 res 累加中间结果 str
        if (n % 2 === 1) res += str;
        // 如果不是第一位，中间结果 str 翻倍（变为上一位字符串的两倍）
        if (n > 1) str += str;
        // 右移一位（向高位移动）
        n >>= 1;
    }
    return res;
}
```

## typeof

``` js
typeof Date(1) === 'string'; // true
typeof Number(1) === 'number'; // true
typeof String('1') === 'string'; // true
typeof Boolean(false) === 'boolean'; // true
typeof Function(false) === 'function'; // true
typeof new Date(1) === 'object'; // true
typeof new Number(1) === 'object'; // true
typeof new String('1') === 'object'; // true
typeof new Boolean(false) === 'object'; // true
typeof new Function(false) === 'function'; // true，注意！
```

+ 通过 new 关键字实例化的对象，typeof 出来的类型不一定是 object （虽然它是 Object 实例或子实例）。
+ 如果 typeof x === 'object' ，那么 x 不一定是 Object 的实例或子实例，如 x 为 null 时，null instanceof Object 为 false。

## Symbol

不能使用 new Symbol() ！只能通过 Symbol() 生成唯一标识，它不是对象。

## Object 和 Function （函数是对象）

``` js
// 函数的 __proto__ 都是同一个对象 Function.prototype ： 
// ƒ () { [native code] }，
// 它的类型是 function ，同时也是 Object 的子实例。

// Object 是 Function 的实例
Object.__proto__ === Function.prototype; // true
Object instanceof Function; // true
// Function 是 Function 的实例
Function.__proto__ === Function.prototype; // true
Function instanceof Function; // true
// Object 是 Object 的子实例
Object.__proto__.__proto__ === Object.prototype; // true
Object instanceof Object; // true
// Function 是 Object 的子实例
Function.__proto__.__proto__ === Object.prototype; // true
Function instanceof Object; // true
```

+ 函数是对象，对象包含函数！
+ 函数都是 Function 的实例，也是 Object 的子实例
+ 对象都是 Object 的实例或子实例

## RegExp

获取正则表达式对象的源字符串

```js
/\d\d\d/.source; // "\d\d\d"

/(\d\d\d)/.source; //"(\d\d\d)"
```

正则表达式分组命名

```js
'aaaaa'.replace(/(?<x>a)/g, '$<x>-'); // "a-a-a-a-a-"

"04-25-2017".replace(/(?<month>\d{2})-(?<day>\d{2})-(?<year>\d{4})/, (...args) => {
  const groups = args.slice(-1)[0];
  const {day, month, year} = groups;
  return `${day}-${month}-${year}`;
}); // "25-04-2017"

'2020-02-02'.match(/(?<年份>\d{4})\-(?<月份>\d{2})\-(?<日>\d{2})/); // 其中groups: {年份: "2020", 月份: "02", 日: "02"}
```

## 微任务和宏任务

```js
var btn = document.getElementById('btn');
btn.addEventListener('click', () => {
    console.log('button click1');
    Promise.resolve().then(() => 
      console.log('microtask')
    );
});
btn.addEventListener('click', () => {
    console.log('button click2');
})
btn.click();
// button click1
// button click2
// microtask
setTimeout(() => btn.click(), 10);
// button click1
// button click2
// microtask
```

如果是用户点击按钮，则输出结果：

```js
// button click1
// microtask
// button click2
```

原因：

+ 在 js 中调用事件，相当于直接调用注册的函数，会按顺序同步执行注册的事件（打印“button click1”），此时微任务回调放到微任务队列，同步代码继续执行（打印“button click2”），待调用栈清空后，开始执行微任务（打印“microtask”）；

+ 用户点击按钮，注册的点击事件有了结果，此时两个按钮事件都已被放进宏任务队列，开始执行第一个回调函数（打印“button click1”），然后遇到微任务，微任务属于 js 线程，它被放到微任务队列，此时调用栈被清空，事件轮询线程优先去微任务队列调度任务执行（打印“microtask”），待微任务队列清空后，从宏任务队列调度任务执行（打印“button click2”）。

Vue 的 nextTick 优先使用微任务实现，如果微任务太多或没有及时执行完微任务，会阻塞页面渲染。

## nextTick setTimeout setImmediate

+ process.nextTick，效率最高，消费资源小，但会阻塞CPU的后续调用；
+ setTimeout，精确度不高，可能有延迟执行的情况发生，且因为动用了红黑树，所以消耗资源大；
+ setImmediate，消耗的资源小，也不会造成阻塞，但效率也是最低的；
+ process.nextTick 属于微任务，比 setTimeout 和 setImmediate 先执行；
+ setTimeoute 和 setImmediate 不在 I/O 回调中时的执行顺序是不确定的，而在 I/O 回调中，I/O 回调由 poll 阶段执行，执行完后进入 check 阶段。在 check 阶段，setImmediate 的回调 比 setTimeout 的回调先执行。

## 其他参考

<https://www.bilibili.com/video/BV1x54y1B7RE?t=1222>
<https://www.bilibili.com/video/BV14t411J7Jv?t=8>
<https://www.bilibili.com/video/BV1a4411F7t7?t=1528>
<https://zhuanlan.zhihu.com/p/168755153>
