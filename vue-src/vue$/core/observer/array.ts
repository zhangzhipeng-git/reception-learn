/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'
/** 得到数组原型对象 */
const arrayProto = Array.prototype
/** 以数组原型对象为原型创建一个对象，相当于原型式继承 */
export const arrayMethods = Object.create(arrayProto)
/** 7 的变异方法（会改变原数组） */
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
/**
 * 拦截变异方法
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 原生方法引用
  const original = arrayProto[method]
  // 为 以数组原型对象为原型创建的对象定义变异拦截方法
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 插入的元素如果是对象，需要被监听
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 通知依赖种的 watcher 更新 
    ob.dep.notify()
    return result
  })
})
