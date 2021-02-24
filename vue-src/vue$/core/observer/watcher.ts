import {
    warn,
    remove,
    isObject,
    parsePath,
    _Set as Set,
    handleError,
    noop
  } from '../util/index'
  
  import { traverse } from './traverse'
  import { queueWatcher } from './scheduler'
  import Dep, { pushTarget, popTarget } from './dep'
  
  import type { SimpleSet } from '../util/index'
import { Component } from '../../types/options'
  /** 每个 Watcher 的唯一 id */
  let uid = 0
  
  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
   */
  /**
   * 观察者，解析表达式，收集依赖。
   * 当表达式的值变化时，会触发回调函数。
   * $watch 函数和指令都会用到这个
   * watcher 只有 3 种：
   * 1. computed watcher 计算属性生成的 watcher
   * 2. user watcher 开发者定义的 watch 生成的 watcher
   * 3. render watcher 实例化组件时生成的 watcher
   * 执行顺序：computed watcher > user watcher > render watcher
   */
  export default class Watcher {
    /** 组件实例 */
    vm: Component;
    /** 要求值的表达式 */
    expression: string;
    /** 回调函数（如用户定义的 watch 某个值的函数） */
    cb: Function;
    /** 每个观察者的唯一 id */
    id: number;
    /** 是否深度观察 */
    deep: boolean;
    /** 是否开发者定义的 Watch */
    user: boolean;
    /** 是否惰性求值，计算属性 */
    lazy: boolean;
    /** 同步执行 watcher run 方法*/
    sync: boolean;
    /**  */
    dirty: boolean;
    /** 是否没有被拆卸， */
    active: boolean;
    /** 旧的依赖集合 */
    deps: Array<Dep>;
    /** 新的依赖集合 */
    newDeps: Array<Dep>;
    /** 旧的依赖 id 集合 */
    depIds: SimpleSet;
    /** 新的依赖 id 集合 */
    newDepIds: SimpleSet;
    /** 渲染 watcher 的 beforeUpdate 钩子 */
    before: Function;
    /** 表达式生成的函数或者 updateComponent  */
    getter: Function;
    /** 新的值 */
    value: any;
    /**
     * Watcher 构造器
     * @param vm 组件实例
     * @param expOrFn updateComponent 或者表达式
     * @param cb 回调函数
     * @param options watcher 选项
     * @param isRenderWatcher 是否渲染的 Watcher ，此时 expOrFn 为 updateComponent
     */
    constructor (
      vm: Component | any,
      expOrFn: string | Function,
      cb: Function,
      options?: Object | any,
      isRenderWatcher?: boolean
    ) {
      this.vm = vm
      // 将 “_watcher” 记录为组件实例的渲染 watcher
      if (isRenderWatcher) {
        vm._watcher = this
      }
      // 组件实例观察者集合加入当前的观察者
      vm._watchers.push(this)
      // options
      if (options) {
        this.deep = !!options.deep
        this.user = !!options.user
        this.lazy = !!options.lazy
        this.sync = !!options.sync
        this.before = options.before
      } else {
        this.deep = this.user = this.lazy = this.sync = false
      }
      this.cb = cb
      this.id = ++uid // uid for batching
      this.active = true
      this.dirty = this.lazy // for lazy watchers
      this.deps = []
      this.newDeps = []
      this.depIds = new Set()
      this.newDepIds = new Set()
      // 用于开发环境，记录表达式
      this.expression = process.env.NODE_ENV !== 'production'
        ? expOrFn.toString()
        : ''
      // parse expression for getter
      // 在实例化组件的时候，expOrFn 为 updateComponent，
      if (typeof expOrFn === 'function') {
        this.getter = expOrFn
      } else { 
        /**
         * 如：
         *  watch: {
              'a.b.c': function(o, n) {}
            }
         * 返回一个函数，获取 this.a.b.c
         */
        this.getter = parsePath(expOrFn)
        if (!this.getter) {
          this.getter = noop
          process.env.NODE_ENV !== 'production' && warn(
            `Failed watching path: "${expOrFn}" ` +
            'Watcher only accepts simple dot-delimited paths. ' +
            'For full control, use a function instead.',
            vm
          )
        }
      }
      // 惰性的不会立即求值，也不会收集依赖
      this.value = this.lazy
        ? undefined
        : this.get()
    }
  
    /**
     * Evaluate the getter, and re-collect dependencies.
     */
    /**
     * 执行 updateComponent 或者表达式函数得到 value
     * 如果是深度观察对象（观察选项的 deep 为 true），会递归收集被观察对象的依赖。
     */
    get () {
      // 计算新值的时候，会将当前的 watcher 设为全局的观察者
      pushTarget(this)
      let value
      const vm = this.vm
      try {
        // 执行 updateComponent 或者执行表达式函数
        value = this.getter.call(vm, vm)
      } catch (e) {
        // 开发者定义的 watch 
        if (this.user) {
          handleError(e, vm, `getter for watcher "${this.expression}"`)
        } else {
          throw e
        }
      } finally {
        // "touch" every property so they are all tracked as
        // dependencies for deep watching
        // 如果是深度观察，则对被观察的对象深度收集依赖
        if (this.deep) {
          traverse(value)
        }
        // 将全局观察者恢复到上一个观察者
        popTarget()
        // 清理依赖，新依赖变为老的依赖
        this.cleanupDeps()
      }
      return value
    }
  
    /**
     * Add a dependency to this directive.
     */
    /**
     * watcher 添加依赖，依赖将 watcher 添加到它的 subs 中
     * 形成一个互相引用的关系
     * @param dep 添加的依赖
     */
    addDep (dep: Dep) {
      const id = dep.id
      if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id)
        this.newDeps.push(dep)
        if (!this.depIds.has(id)) {
          dep.addSub(this)
        }
      }
    }
  
    /**
     * Clean up for dependency collection.
     */
    /**
     * 清除依赖，新的依赖变为旧的依赖
     */
    cleanupDeps () {
      let i = this.deps.length
      while (i--) {
        const dep = this.deps[i]
        if (!this.newDepIds.has(dep.id)) {
          dep.removeSub(this)
        }
      }
      let tmp: SimpleSet | any[] = this.depIds
      this.depIds = this.newDepIds
      this.newDepIds = tmp
      this.newDepIds.clear()
      tmp = this.deps
      this.deps = this.newDeps
      this.newDeps = tmp
      this.newDeps.length = 0
    }
  
    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     */
    /**
     * 如果是计算属性，将 watcher 标记为脏
     * 
     * 如果是同步更新，立即执行 run 方法
     * 
     * 如果 wath 的 async 配置为 true ，加入观察者队列，
     * 同步执行（当前正在刷新）或异步执行 run 方法 和 
     * beforeUpdate 方法（只有渲染观察者才有）
     * 
     * run 方法：重新计算新值，如果是深度观察，还会重新递归
     * 收集被观察对象的依赖，然后调用开发者定义的 watch 回
     * 调函数。
     */
    update () {
      /* istanbul ignore else */
      // 惰性的的时候，更新将 watcher 标记为脏
      if (this.lazy) {
        this.dirty = true
      } else if (this.sync) {
        // 同步更新，立即计算值和调用回调
        this.run()
      } else {
        queueWatcher(this)
      }
    }
  
    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     */
    /**
     * 重新计算新值，如果是深度观察，还会重新递归收集被观察对象的依赖，
     * 然后调用开发者定义的 watch 回调函数。
     */
    run () {
      // 没有被拆卸
      if (this.active) {
        // 重新执行表达式
        const value = this.get()
        // 如果新值和旧值不相等或新值是一个对象或需要深度观察，
        // 则会调用开发者定义的 watch 回调函数，
        // 所以在被观察者是一个对象或 deep 选项为 true的时候，
        // 回调中传入的新值和旧值有可能是相同的
        if (
          value !== this.value ||
          // Deep watchers and watchers on Object/Arrays should fire even
          // when the value is the same, because the value may
          // have mutated.
          isObject(value) ||
          this.deep
        ) {
          // set new value
          const oldValue = this.value
          this.value = value
          // 调用
          if (this.user) {
            try {
              this.cb.call(this.vm, value, oldValue)
            } catch (e) {
              handleError(e, this.vm, `callback for watcher "${this.expression}"`)
            }
          } else {
            this.cb.call(this.vm, value, oldValue)
          }
        }
      }
    }
  
    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     */
    /**
     * 调用 get ，计算新值，将观察者的“脏”标志变为false
     * 只会被惰性的观察者调用
     */
    evaluate () {
      this.value = this.get()
      this.dirty = false
    }
  
    /**
     * Depend on all deps collected by this watcher.
     */
    /**
     * 全局的观察者添加这个 watcher 的所有旧依赖，
     * 这个 watcher 的所有旧的依赖将全局的观察者添加
     * 它们各自的 subs 中。
     */
    depend () {
      let i = this.deps.length
      while (i--) {
        this.deps[i].depend()
      }
    }
  
    /**
     * Remove self from all dependencies' subscriber list.
     */
    /**
     * 拆卸观察者
     * 
     * 将它从组件实例的 _watchers 中剔除，
     * 因为 watcher 的依赖引用了 watcher，所以在拆卸的时候，
     * 它的依赖也需要也要移除 watcher
     */
    teardown () {
      if (this.active) {
        // remove self from vm's watcher list
        // this is a somewhat expensive operation so we skip it
        // if the vm is being destroyed.
        var this_vm : any = this.vm;
        if (!this_vm._isBeingDestroyed) {
          remove(this_vm._watchers, this)
        }
        let i = this.deps.length
        while (i--) {
          this.deps[i].removeSub(this)
        }
        this.active = false
      }
    }
  }
  