/* globals MutationObserver */

import { noop } from '../../shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'
/** 默认不使用微任务 */
export let isUsingMicroTask = false
/** 回调函数集合 */
const callbacks = []
/** 是否挂起，默认不挂起，即异步任务是否已完成 */
let pending = false
/**
 * 刷新回调函数队列
 */
function flushCallbacks () {
  // 标记非挂起状态。
  // 必须在刷新完前就标记为非挂起状态，
  // 如果等所有回调执行完再改为非挂起，
  // 则这一轮事件循环的回调中 nextTick 注册的函数永远无法执行，
  // 因为 pending 还是 true ，它只是加入了回调队列，并未开启新的异步任务
  pending = false
  // 相当于生成一个快照
  const copies = callbacks.slice(0)
  // 置空原来的回调容器
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
/**
 * 这里使用微任务执行异步任务
 * 在2.5的版本里，使用宏任务的时候，在重绘之前改变数据状态会有一些问题
 * 所以现在都改为使用微任务
 * 这种权衡的一个主要缺点是存在一些场景
 * 然而微任务的优先级太高，那么它就会被触发连续事件(例如:#4521，#6690)或者甚至在同一个事件(#6566)之间冒泡。
 */
let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
/**
 * nextTick 的表现行为利用了微任务队列，通过原生的
 * Promise.then 或 MutationObserver 启用微任务执行任务队列
 * 如果不支持微任务，会降降级为宏任务。
 * 然而 MutationObserver 在 IOS >= 9.3.3 的版本中有 bug，
 * 所以，如果 Promise 可用，那么优先使用 Promise
 * 然后是 MutationObserver ，其次是 setImmediate ，
 * 再次是 setTimeout
 */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    /**
     * 如果 IOS 的 UIWebview 有问题，
     * 在 Promise.then 还没有执行完，往任务队列推入任务时，
     * 如果浏览器没有执行其他工作，队列就不会刷新。
     * 所以这里设一个空的定时任务，强制刷新任务队列
     */
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
/**
 * 下一个嘀嗒，应该是想模拟 nodejs 的 nextTick，推入回调任务到回调队列，回调队列会紧跟在上一轮事件循环完成后执行
 * 
 * 如果当前任务是挂起状态（新开了异步任务但回调队列还未开始执行），则将回调 cb 推入还未执行的回调队列，在在上一轮事件循环结束后执行
 *
 * 如果当前任务不是挂起状态（回调队列已开始执行），则新开异步任务变为挂起状态，回调队列在上一轮事件循环（包含上一轮的 nextTick 开启的任务）结束后执行
 * @param cb 回调函数
 * @param ctx 上下文
 */
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) { 
      // 调用一次 nextTick() 并不传入任何参数，返回一个 Promise 实例，_resolve 也会存在
      // 然后再调用 nextTick() 同样不传入任何参数，
      // 在它之前的 nextTick 注册的回调都执行完后，会去调用 Promise 实例的 then 注册的方法
      /**
       * const promise = this.$nextTick();
       * if (!promise) { return; }
       * promise.then(() => { console.log(4); });
       * this.$nextTick(() => { console.log(1); });
       * this.$nextTick(() => { console.log(2); });
       * this.$nextTick(() => { console.log(3); });
       * this.$nextTick();
       * // 结果 1 2 3 4
       */
      _resolve(ctx)
    }
  })
  // 可以新开异步任务了
  if (!pending) {
    pending = true
    timerFunc() 
  }
  // $flow-disable-line
  // 应该是 cb 和 ctx 都没有传入并且支持 Promise 时才会有 _resolve
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    }) 
  }
}
