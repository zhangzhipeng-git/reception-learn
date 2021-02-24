import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'
/** 依赖的唯一 id */
let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
/**
 * 依赖是被观察的，被注册的 watcher 都放在它的 subs 中
 * dep 的 notify 方法可以通知被注册的 watchers 
 */
export default class Dep {
  static target: Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  /**
   * 注册观察者 watcher
   * @param sub 观察者
   */
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  /**
   * 移除指定的观察者
   * @param sub 观察则
   */
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  /**
   * 1.本依赖将全局的 watcher 注册到它的 subs 中
   * 
   * 2.将本依赖添加到全局 watcher 的依赖集合中
   */
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  /**
   * 通知依赖这个依赖的所有 watcher 做更新
   */
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []
/**
 * 设置全局观察者，和将全局观察者推入全局观察者轨迹栈
 * 不穿参数，则没有全局观察者，Vue 中有很多这种调用，
 * 避免收集不必要的依赖
 * @param target 全局观察者
 */
export function pushTarget (target?: Watcher) {
  targetStack.push(target)
  Dep.target = target
}
/**
 * 恢复到上一个全局观察者
 */
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
