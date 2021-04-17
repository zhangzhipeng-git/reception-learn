import { hasOwn } from '../../shared/util'
import { warn, hasSymbol } from '../util/index'
import { defineReactive, toggleObserving } from '../observer/index'
import { Component } from '../../types'

/**
 * 初始化提供
 * @param vm 组件实例
 */
export function initProvide (vm: Component | any) {
  // 得到 provide
  const provide = vm.$options.provide
  // 如果是函数则执行它，并赋值到 vm 的 _provide 上
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}
/**
 * 初始化注入
 * @param vm 组件实例
 */
export function initInjections (vm: Component | any) {
    // 解析注入，得到 inject-provide 键值对象
  const result = resolveInject(vm.$options.inject, vm)
  // 存在结果
  if (result) {
      // 关闭数据观测
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      // 将注入定义成响应式
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
    // 恢复观测
    toggleObserving(true)
  }
}
/**
 * 解析注入，从子组件到父组件遍历，找对应的 provide ，
 * 最后返回一个 注入提供键值 对象。
 * @param inject 注入
 * @param vm 组件实例
 */
export function resolveInject (inject: any, vm: Component): Object {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    // 支持获取 Symbol 指定的键
    const keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // #6574 in case the inject object is observed...
      // 跳过观测者对象
      if (key === '__ob__') continue
      const provideKey = inject[key].from
      let source: any = vm
      // 从子组件向父组件遍历找对应的 provide
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
      // 没有实例
      if (!source) {
          // 如果有默认值，就用默认值
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault
        } else if (process.env.NODE_ENV !== 'production') {
            // 找不到提供
          warn(`Injection "${key as any}" not found`, vm)
        }
      }
    }
    // 返回解析的 注入提供键值 对象
    return result
  }
}
