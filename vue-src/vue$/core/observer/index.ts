/* @flow */

import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

// 获取数组 7 个变异方法
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
/**
 * 在某些情况下（？）我们想要禁用监听组件内部的更新计算
 */
export let shouldObserve: boolean = true
/**
 * 监听数据变化状态切换
 * @param value true - 监听，false - 不监听
 */
export function toggleObserving (value: boolean) {
  shouldObserve = value
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
/**
 * 观测数据，递归地为被观测对象的属性设置 setter 
 * 和 getter。getter 负责收集依赖，局部依赖将全
 * 局观察者添加到它的 subs 中，setter 负责通知局
 * 部依赖的 subs 中所有 watcher 做更新。
 */
export class Observer {
  /** 被监听的对象 */
  value: any;
  /** 依赖实例 */
  dep: Dep;
  /** 统计使用 value 作为根数据的组件实例个数，实际上就是统计这个组件被使用了多少次 */
  vmCount: number; // number of vms that have this object as root $data

  /**
   * 实例化监听器（监听即设置 setter 和 getter）
   * @param value 被监听的对象
   */
  constructor (value: any) {
    this.value = value
    /** 一个 observer 对应一个 dep */
    this.dep = new Dep()
    this.vmCount = 0
    /** 将监听器作为 __ob__ 挂载到被监听的对象上 */
    def(value, '__ob__', this)
    /** 如果被监听对象是数组，改变它的原型，继续遍历数组递归监听 */
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // 遍历对象数组，递归监听
      this.observeArray(value)
    } else {
      // 对象，遍历对象的属性值，递归监听
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  /**
   * 为对象的属性添加 setter 和 getter
   * @param obj 被观测的对象
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
/**
 * 将目标对象 target 的原型链指向源对象 src
 * @param target 目标对象
 * @param src 源对象
 */
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
/**
 * 不支持原型指向 __proto__ 则使用这个方法，
 * 手动将源对象 src 的属性和值浅复制到目标
 * 对象 target 
 * @param target 目标对象
 * @param src 源对象
 * @param keys 7 种变异方法
 */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe (value: any, asRootData?: boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
/**
 * 可以递归地为对象设置 setter 和 getter，
 * getter 收集依赖，闭包的局部依赖注册全局
 * 观察者，getter 通知更新，闭包的局部依赖
 * 通知观察者进行更新。
 * @param obj 被观测对象
 * @param key 属性
 * @param val 属性值
 * @param customSetter 用户定义的 setter
 * @param shallow 是否非递归监听，默认是递归的
 */
export function defineReactive (
  obj: Object,
  key: string,
  val?: any,
  customSetter?: Function,
  shallow?: boolean
) {
  // 被闭包的局部依赖，递归观测的每个属性都有一个闭包局部依赖
  const dep = new Dep()
  // 获取对象 obj key 对应的属性描述器（{get: xx, set: xx, configurable: xx...}）
  const property = Object.getOwnPropertyDescriptor(obj, key)
  // 不可删除属性值和不可修改描述器的 writeable，则不观测该数据
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 获取预定义描述器的 getter 和 setter
  // 在被观测之前，可能开发者使用了 
  // Object.defineProperty(obj, key, {
  //   get() {
  //     // ...
  //   },
  //   set() {
  //     // ...
  //   }
  // }) 
  const getter = property && property.get
  const setter = property && property.set
  // 没有 getter 或 存在 setter ，
  // 并且参数只传了 obj 和 key ，
  // 有 getter ，用 getter 获取值。
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  // 递归观测数据 val ，得到观测器
  let childOb = !shallow && observe(val)
  // 设置 setter 和 getter
  Object.defineProperty(obj, key, {
    enumerable: true, // 可枚举，不可枚举时控制台属性灰色
    // 可配置，为 false 时（不能删除属性值，不可修改 writeable）
    configurable: true, 
    get: function reactiveGetter () {
      // 有预定义的 getter 则执行预定义的 getter 获取 value
      const value = getter ? getter.call(obj) : val
      // 如果存在全局观察者，则进行依赖收集
      if (Dep.target) {
        // 闭包的局部依赖将全局的 watcher 添加到它的 subs 中
        dep.depend()
        // 如果是递归观测，则有子观测者。
        if (childOb) {
          // 这里是为了“调用 Vue.set ， Vue.delete 
          // 和响应式数组的 7 个变异方法时通知 watcher 
          // 更新”而服务，通过获取观测者的 dep ，进而
          // 通知 watcher 更新。对于根数据 $data ，不
          // 需要这一步。
          childOb.dep.depend()
          // 这里不是很明白为什么还要收集一次，
          // 上面应该已经包含了数组元素依赖的收集
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      // 获取旧值
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      // 新旧值不一样，或者新值和旧值都是NaN（因为 NaN !== NaN）则退出
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      // customSetter，如：警告不能在子组件直接修改父组件传入的 props
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      // 有 getter ，但是没有 setter ，不需要设置新值
      if (getter && !setter) return
      // 有 setter 设置新值
      if (setter) {
        setter.call(obj, newVal)
      } else {
        // 这个 val 也是闭包的,
        // 将 val 设置 newVal ，
        // 下次获取的时候就是这个 newVal 。
        val = newVal
      }
      // 需要观测新值
      childOb = !shallow && observe(newVal)
      // setter 执行后，需要通知 watcher 更新 
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
/**
 * 为响应式数据添加属性
 * @param target 目标对象
 * @param key 属性
 * @param val 值
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  // 当 target 不存在或是基本类型的时候，开发模式下给个警告
  // 代码还是可以正常运行的。
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target)}`)
  }
  // 如果是数组，则在 key 的位置插入新元素 val，splice 方法会触发更新
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  // 目标对象存在 key 并且 key 不是 Object 原型对象上的属性
  // 已经存在的属性直接赋值改变即可，会调用 setter 通知更新，
  // 但是不能改变从原型继承来的属性
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // 获取监听器
  const ob: any = (target as any).__ob__
  // 如果 target 是组件实例或者是根数据，发出一个警告
  if ((<any>target)._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // 没有监听器，只是设置或添加新值，并不通知更新
  if (!ob) {
    target[key] = val
    return val
  }
  // 为新添加的 val 设置 setter 和 getter
  defineReactive(ob.value, key, val)
  // 通知更新
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
/**
 * 和 set 相反，这个是删除目标对象 target 的属性 key，
 * 也会做通知更新。
 * @param target 目标对象
 * @param key 属性
 */
export function del (target: Array<any> | Object, key: any) {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target as any).__ob__
  if ((<any>target)._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
