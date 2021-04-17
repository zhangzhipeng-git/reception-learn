/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import Dep, { pushTarget, popTarget } from '../observer/dep'
import { isUpdatingChildComponent } from './lifecycle'


import {
  set,
  del,
  observe,
  defineReactive,
  toggleObserving
} from '../observer/index'

import {
  warn,
  bind,
  noop,
  hasOwn,
  hyphenate,
  isReserved,
  handleError,
  nativeWatch,
  validateProp,
  isPlainObject,
  isServerRendering,
  isReservedAttribute
} from '../util/index'
import { Component } from '../../types/options'
/**
 * 共享的属性描述器
 */
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}
/**
 * 代理目标对象 target 的 sourceKey 属性值中对 key 属性的访问和设置
 * @param target 目标对象
 * @param sourceKey 源 key
 * @param key 目标 key
 */
export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
/**
 * 初始化组件状态
 * 1. 初始化 props
 * 2. 初始化 methods
 * 3. 初始化 data
 * 4. 初始化计算属性
 * 5. 初始化 watch
 * @param vm 组件实例
 */
export function initState (vm: Component | any) {
  // 组件实例的 watcher 集合
  vm._watchers = []
  // 组件实例选项
  const opts = vm.$options
  // 初始化 props 
  if (opts.props) initProps(vm, opts.props)
  // 初始化 methods
  if (opts.methods) initMethods(vm, opts.methods)
  // 初始化 data
  if (opts.data) {
    initData(vm)
  } else {
    // 组件选项没有 data
    observe(vm._data = {}, true /* asRootData */)
  }
  // 初始化计算属性
  if (opts.computed) initComputed(vm, opts.computed)
  // 初始化 watch
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
/**
 * 初始化 props
 * @param vm 组件实例
 * @param propsOptions props 选项
 */
function initProps (vm: Component | any, propsOptions: Object) {
  // props 选项
  const propsData = vm.$options.propsData || {}
  /** vm._props */
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  // props 键集合
  const keys = vm.$options._propKeys = []
  /** 是否根组件 */
  const isRoot = !vm.$parent
  // root instance props should be converted
  // 不是根组件，关闭数据观测，
  // 因为它是父组件传入的，所以
  // 已经被观测过了，在设置 setter 
  // 和 getter 的时候不需要观测。
  if (!isRoot) {
    toggleObserving(false)
  }
  // 遍历 props 选项，key 对应的是父组件的 data 中的 key
  for (const key in propsOptions) {
    keys.push(key)
    // 返回 key 对应的 value
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */

    // 将 vm._props 设为响应式的。 
    // vm._props 最开始是没属性 key 的，未设置就获取，获取到
    // 的是 undefined，需要调用一下 setter 才有值。

    // 开发模式下
    if (process.env.NODE_ENV !== 'production') {
      // 转为连字符，判断是否保留属性
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      // 递归地为 vm._props 属性 key 设置 setter 和 getter
      defineReactive(props, key, value, () => {
        // 不是根节点并且子组件不在更新中，
        // 会被认为是在子组件中直接修改父
        // 组件传入的 props 的值，props
        // 的值只能在父组件中修改。根组件
        // 没有父节点，可以直接修改 props 
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      // 递归地为 vm._props 属性 key 设置 setter 和 getter
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    // 静态的 props 被代理到在组件原型上，
    // 像 <blog-post v-bind:likes="42"></blog-post> 这种
    // 直接绑定一个字面量的就是静态 props
    // 设置 _props 中 key 对应的值可以直接在组件实例上访问
    // 将 vm._props.key 获取 key 的方式变为 vm.key 这种获取方式
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
/**
 * 初始化 data
 * @param vm 组件实例
 */
function initData (vm: Component | any) {
  let data = vm.$options.data
  // 如果 data 是函数，则调用函数得到 data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
    // 如果得到的 data 不是纯对象，则开发模式下会警告
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  // 得到 data 的属性键集合
  const keys = Object.keys(data)
  // 得到 props
  const props = vm.$options.props
  // 得到 methods
  const methods = vm.$options.methods
  let i = keys.length
  // 检查 props 和 methods 中是否有和 data 中相同的属性
  // 有的化，在开发模式下会警告。
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      // 如果不是以 $ 或 _ 开头的属性
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 观测 data
  observe(data, true /* asRootData */)
}
/**
 * 获得 data
 * @param data data 函数
 * @param vm 组件实例
 */
export function getData (data: Function, vm: Component): any {
  // #7573 disable dep collection when invoking data getters
  // 这里要将全局的 watcher 置空，props 中的值来自父组件的 data，
  // 在调用 data 函数的过程中，可能会触发 props 中的依赖收集，而
  // watcher.get() 的时候，会触发 data 中属性的 getter 又会收集
  // 一次依赖，造成冗余依赖。
  pushTarget()
  try {
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, `data()`)
    return {}
  } finally {
    popTarget()
  }
}
/** 计算属性 watcher 选项 {lazy: true} */
const computedWatcherOptions = { lazy: true }
/**
 * 初始化计算属性，创建计算属性 watcher
 * @param vm 组件实例
 * @param computed 计算属性
 */
function initComputed (vm: Component | any, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()
  // 遍历计算属性
  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 开发模式下，如果未设置 getter 则警告
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }
    // 非服务端的时候，创建计算属性 watcher
    // ssr 的时候不需要 watcher
    if (!isSSR) {
      // create internal watcher for the computed property.
      // 创建计算属性，这时全局观察者还没有生成，因为计算
      // 属性观察者不会立即执行 get 方法，get 方法执行时
      // 将全局观察者变成 get 的调用者。
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      // 定义计算属性
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      // 在 data 中已经定义过则警告
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}
/**
 * 定义计算属性
 * @param target 目标对象，组件实例
 * @param key 属性键
 * @param userDef get 或 包含 get 的对象
 */
export function defineComputed (
  target: any,
  key: string,
  userDef: {get: () => any, set?: () => any, cache?: boolean} | Function
) {
  // 服务端不缓存计算属性
  const shouldCache = !isServerRendering()
  // userDef 是 getter
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key) // 缓存
      : createGetterInvoker(userDef) // 不缓存
    sharedPropertyDefinition.set = noop
  } else {
    // userDef 是对象
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  //  如果没有设置 setter ，在开发模式下，调用的时候会警告
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  // 将 key 定义到组件实例上
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
/**
 * 创建计算属性 getter 并返回
 * @param key 计算属性 key
 */
function createComputedGetter (key) {
  return function computedGetter () {
    // 获取组件实例的计算属性 key 对应的 watcher
    const watcher: Watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // 如果是脏的（watcher 执行 update 的时候为“脏”）
      // 则求值，因为初次渲染会执行 updateComponent ，
      // 他会通知 watcher 做第一次 update，所以计算属性会有值，
      // 而不是 undefined 。后续如果计算属性 watcher没有 update ，
      // 那么它的值就一直是之前的值。
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}
/**
 * 初始化方法，校验方法名，赋值默认空函数
 * @param vm 组件实例
 * @param methods method object
 */
function initMethods (vm: Component | any, methods: Object) {
  const props = vm.$options.props
  // 校验是否定义过的 key
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    // 不是函数则替换为空函数
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}
/**
 * 初始化用户 watcher，
 * 创建用户 watcher
 * @param vm 组件实例
 * @param watch watch 用户定义的 watch
 */
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    // 监听 key 值变化的函数有多个（数组） 
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      // 只有一个 key 值的监听函数
      createWatcher(vm, key, handler)
    }
  }
}
/**
 * 创建用户 watcher
 * @param vm 组件实例
 * @param expOrFn 计算表达式（是 data 的 key）
 * @param handler 监听器或组件实例普通方法中的函数名或选项
 * @param options 选项
 */
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) { // 纯对象选项
    options = handler
    handler = handler.handler // 从选项中获取监听函数
  }
  if (typeof handler === 'string') { // 是普通函数的名称
    // 获取对应的普通函数
    handler = vm[handler]
  }
  // 创建用户 watcher
  return (<any>vm).$watch(expOrFn, handler, options)
}
/**
 * 状态混合
 * @param Vue Vue 构造器
 */
export function stateMixin (Vue: Function) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef: any = {}
  // getter 获取组件实例的 _data ，即 data
  dataDef.get = function () { return this._data }
  const propsDef: any = {}
  // getter 获取组件实例的 _props ，即 props
  propsDef.get = function () { return this._props }
  // 不能设置 $data 和 $props
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  // 为组件实例原型设置 $data ， $props
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)
  // 响应式添加
  Vue.prototype.$set = set
  // 响应式删除
  Vue.prototype.$delete = del
 
  /**
   * 创建用户 watcher
   * @param  {string|Function} expOrFn 计算属性
   * @param  {any} cb 监听回调函数
   * @param  {Object} options? 选项
   * @returns Function
   */
  Vue.prototype.$watch = function ( expOrFn: string | Function, cb: any, options?: Object | any ): Function {
    const vm: Component = this
    // 回调函数是个纯对象，回溯到 createWatcher 
    if (isPlainObject(cb)) { 
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    // 标记为是用户 watcher
    options.user = true
    // 创建用户 watcher
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // 立即观察，立即调用回调，再创建完组件实例前就调用回调
    if (options.immediate) {
      try {
        // 调用 watch 回调
        cb.call(vm, watcher.value)
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
      }
    }
    // 返回一个拆卸该观察者的函数，拆卸后即使数据变化也不会调用它，
    // 因为拆卸后，响应式数据对应的局部依赖中没有这个 watcher。
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
