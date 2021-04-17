import {
  warn,
  once,
  isDef,
  isUndef,
  isTrue,
  isObject,
  hasSymbol,
  isPromise,
  remove
} from '../../util/index'

import { createEmptyVNode } from '../../vdom/vnode'
import { currentRenderingInstance } from '../../instance/render'
import { Component, VNode, VNodeData } from '../../../types'
/**
 * 获取构造器
 * @param comp 组件选项或组件构造器
 * @param base 基类
 */
function ensureCtor (comp: any, base) {
  // 是 es 模块，获取默认导出
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default
  }
  // 如果是对象，base 继承 comp，否则取 comp
  return isObject(comp)
    ? base.extend(comp)
    : comp
}
/**
 * 创建异步占位节点（用于组件懒加载）
 * @param factory 工厂函数
 * @param data 虚拟节点 data
 * @param context 组件实例
 * @param children 虚拟子节点集合
 * @param tag 标签名
 */
export function createAsyncPlaceholder (
  factory: Function,
  data: VNodeData,
  context: Component,
  children: VNode[],
  tag: string
): VNode {
  // 创建空的注释节点
  const node = createEmptyVNode()
  // 节点的工厂函数（生产组件）
  node.asyncFactory = factory
  // 添加异步元数据（虚拟节点 data ，组件上下文，虚拟子节点结合，标签名）
  node.asyncMeta = { data, context, children, tag }
  return <any> node
}
/**
 * 解析异步组件，会执行两次，第一次返回 undefined ，
 * 第二次返回解析成功的组件构造器
 * @param factory 工厂函数
 * @param baseCtor 父类构造器
 */
export function resolveAsyncComponent (
  factory: Function | any,
  baseCtor: FunctionConstructor
): FunctionConstructor | void {
  // 函数出错并且有错误的组件，返回错误的组件
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }
  // 已解析，返回解析的组件
  if (isDef(factory.resolved)) {
    return factory.resolved
  }
  /** 当前渲染实例 */
  const owner = currentRenderingInstance
  // 工厂函数没有归属 ， 则将当前正在渲染的实例加入到它的 owers 集合中
  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner)
  }
  // 工厂正在加载并且有加载组件，返回加载组件
  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }
  // 如果工厂函数没有归属实例
  if (owner && !isDef(factory.owners)) {
    const owners = factory.owners = [owner]
    let sync = true
    let timerLoading = null
    let timerTimeout = null
    // 实例绑定一个销毁事件，从归属者里移除当前的渲染实例
    ;(owner as any).$on('hook:destroyed', () => remove(owners, owner))
    // 强制渲染，强制更新函数
    const forceRender = (renderCompleted: boolean) => {
      for (let i = 0, l = owners.length; i < l; i++) {
        (owners[i] as any).$forceUpdate()
      }
      // 渲染完成
      if (renderCompleted) {
        // 移除所有归属者
        owners.length = 0
        // 加载定时器
        if (timerLoading !== null) {
          clearTimeout(timerLoading)
          timerLoading = null
        }
        // 超时定时器
        if (timerTimeout !== null) {
          clearTimeout(timerTimeout)
          timerTimeout = null
        }
      }
    }
    // 解析组件函数
    const resolve = once((res: any) => {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor)
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      // 不是同步的，则强制更新
      if (!sync) {
        forceRender(true)
      } else { // 是同步，移除所有归属者
        owners.length = 0
      }
    })
    // 解析错误函数
    const reject = once((reason: any) => {
      // 组件解析错误
      process.env.NODE_ENV !== 'production' && warn(
        `Failed to resolve async component: ${String(factory)}` +
        (reason ? `\nReason: ${reason}` : '')
      )
      // 如果有错误组件则强制更新
      if (isDef(factory.errorComp)) {
        factory.error = true
        forceRender(true)
      }
    })
    // 1. 工厂函数加载，执行到这里 ，res 是 undefined
    //   Vue.component('HelloWorld',function(resolve,reject){     　　//重写HelloWorld组件的定义
    //     require(['./components/HelloWorld'],function(res){
    //         resolve(res)
    //     })
    // })
    const res = factory(resolve, reject)
  
    /*高级组件的逻辑*/
    if (isObject(res)) {
      // 2. Promise 加载， res 是一个 Promise
      // Vue.component('HelloWorld',()=>import('./components/HelloWorld'))
      // (function () { return Promise.resolve().then(function () { return require('./my-async-component'); }); });
      if (isPromise(res)) { // Promise
        // () => Promise
        if (isUndef(factory.resolved)) { // 异步的 Promise
          <Promise<unknown>> res.then(resolve, reject)
        }
      } else if (isPromise(res.component)) { // 高级异步组件的分支
        // 3. 高级异步组件
        //  Vue.component('HelloWorld',() => ({
        //   // 需要加载的组件 (应该是一个 `Promise` 对象)
        //   component: import('./MyComponent.vue'),
        //   // 异步组件加载时使用的组件
        //   loading: LoadingComponent,
        //   // 加载失败时使用的组件
        //   error: ErrorComponent,
        //   // 展示加载时组件的延时时间。默认值是 200 (毫秒)
        //   delay: 200,
        //   // 如果提供了超时时间且组件加载也超时了，
        //   // 则使用加载失败时使用的组件。默认值是：`Infinity`
        //   timeout: 3000
        // }))
        res.component.then(resolve, reject)

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor)
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor)
          if (res.delay === 0) {
            factory.loading = true
          } else {
            timerLoading = setTimeout(() => {
              timerLoading = null
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true
                forceRender(false)
              }
            }, res.delay || 200)
          }
        }

        if (isDef(res.timeout)) {
          timerTimeout = setTimeout(() => {
            timerTimeout = null
            if (isUndef(factory.resolved)) {
              reject(
                process.env.NODE_ENV !== 'production'
                  ? `timeout (${res.timeout}ms)`
                  : null
              )
            }
          }, res.timeout)
        }
      }
    }

    sync = false
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}
