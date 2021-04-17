import type Watcher from './watcher'
import config from '../config'
import { callHook, activateChildComponent } from '../instance/lifecycle'
import { Component } from '../../types/options';

import {
  warn,
  nextTick,
  devtools,
  inBrowser,
  isIE
} from '../util/index'
/** 最大的更新次数，100 */
export const MAX_UPDATE_COUNT = 100
/** 观察者队列 */
const queue: Array<Watcher> = []
/** 被激活的子组件的集合 */
const activatedChildren: Array<Component> = []
/** 在每次刷新观察者队列时，是否已经将这个观察者推入了队列  */
let has: { [key: number]: true } = {}
/** 每次刷新观察者队列时，记录每一个观察者的执行次数 */
let circular: { [key: number]: number } = {}
/** 等待中 */
let waiting = false
/** 刷新中 */
let flushing = false
/** 刷新观察者队列时，记录刷新到了哪个观察者，index是它在队列中的下表 */
let index = 0

/**
 * Reset the scheduler's state.
 */
/**
 * 重置调度器的状态
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
/**
 * 添加事件监听器的时候需要使用 timestamp
 * 为了修复 #6566 这个 bug：
 * 执行第一个事件，然后改变数据，会执行微任务队列（微
 * 任务优先于下一个宏任务），Vue 发现 v-if 控制的 Html 
 * 结构相同，于是复用了 Html 结构，只变更了事件监听器。
 * 然后事件冒泡，又会立即执行变更后的监听器。
 * 
 * 如果是宏任务实现的 nextTick ， 冒泡会在宏任务队列之前执行，
 * 如果没有其他的监听器，便结束事件，不会出现上面那个 bug，
 * 然而 nextTick 优先用宏任务实现，会出现更多的问题。
 */
export let currentFlushTimestamp = 0

// Async edge case fix requires storing an event listener's attach timestamp.
let getNow: () => number = Date.now

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  const performance = window.performance
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = () => performance.now()
  }
}

/**
 * Flush both queues and run the watchers.
 */
/**
 * 刷新观察者队列
 */
function flushSchedulerQueue () {
  // 记录刷新的时间
  currentFlushTimestamp = getNow()
  // 标记刷新中
  flushing = true
  // 观察者，观察者 id
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  // 在刷新队列前，需要对观察者根据 id 排序，
  // 先创建的 watcher 要先执行更新操作。
  // 1. 组件创建的顺序是从父组件到子组件进行创建，当组件观察者做更新的时候，也是从父组件到子组件；
  // 2. 用户定义的观察者在 render watcher 之前更新，因为用户定义的观察者在渲染观察者之前创建；
  // 3. 如果一个组件在父组件的观察者更新的时候被销毁了，那么它会被跳过。
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // 就是在刷新观察者的时候，可能会有新的观察者被推入进来呗
  // 所以要使用 queue.length 来保证获取最新的 length
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    // 如果是渲染的 watcher ，它会有 beforeUpdate 钩子
    if (watcher.before) {
      watcher.before()
    }
    // 观察者 id
    id = watcher.id
    // 利用 map结构 标记一下这个 watcher
    has[id] = null
    // 观察者的更新操作
    watcher.run()
    // 开发模式下，在每一轮的刷新观察者队列的任务中，需要检查每个观察者的更新次数
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  // 在完成刷新队列后，记录下激活的子组件集合和观察者队列
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()
  // 重置调度任务的状态
  resetSchedulerState()

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}
/**
 * 调用 update 钩子，只针对渲染观察者
 * 看得出来这个钩子在渲染观察者比较多且
 * 数据变化的时候，调用的次数还蛮多的。
 * @param queue 观察者队列
 */
function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    // 需要是渲染观察者 && 组件已被挂载 && 组件没被销毁
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
/**
 * patch：虚拟 dom diff 后的变化 patch 到真实 dom 上 。
 * 排队 在做 patch 的时候 被激活的组件，
 * 在树被 patch 后，队列会被处理
 * @param vm 组件实例
 */
export function queueActivatedComponent (vm: Component) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  (<any>vm)._inactive = false
  activatedChildren.push(vm)
}
/**
 * 刷新观察者队列的时候，调激活钩子
 * @param queue 激活的子组件队列
 */
function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    // 标记子组件处于激活态
    queue[i]._inactive = true
    // 激活子组件
    activateChildComponent(queue[i], true /* true */)
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
/**
 * 如果观察者队列正在刷新，则将观察者添加到当前的刷新队
 * 列中去。如果刷新完了，则将观察者推入队列，并开始新的一
 * 轮刷新
 * @param watcher 观察者
 */
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  // 确保在每轮的刷新观察者队列的时候，相同的观察者 run 方法
  // 只会被执行一次
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      // 不在刷新中，直接推入队列
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // 在刷新队列的时候，观察者执行 run 的时
      // 候可能会触发其他观察者做更新，如果在刷
      // 新中，则将它插入到当前有序的队列里。
      let i = queue.length - 1
      // 这个 index 是该模块公用的 index 
      // 如果队列还没有刷新完，根据 id 找到插入的位置
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      // 插入当前还未刷新完的队列
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    // 上一轮刷新任务队列的任务还已完成，

    // 这里 waiting 和 nextTick 的 pending 相似。
    
    // 观察者任务队列的任务都是同步的，任务队列开始
    // 执行后，在所有任务完成前后再改为非等待状态都
    // 可以。

    // 而 ntextTick 中任务队列的任务是可以是异步的
    // ntextTick 需要在队列任务执行完前将状态改为
    // 非挂起状态，否则任务队列中再次用 nextTick 注
    // 册的任务无法执行！
    if (!waiting) {
      // 标记要开始执行任务了，需要等待
      waiting = true
      // 如果是开发模式，直接同步刷新观察者队列
      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      // 生产模式，使用异步任务刷新观察者队列
      nextTick(flushSchedulerQueue)
    }
  }
}
