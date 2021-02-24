import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'
import { Component, InternalComponentOptions } from '../../types'
/** 组件实例唯一 id */
let uid = 0
/**
 * 初始化混合，给 Vue 安装 _init 函数
 * 1. 合并组件选项
 * 2. 初始化生命周期
 * 3. 初始化事件
 * 4. 初始化 render
 * 5. 调用 beforeCreate 钩子
 * 6. 初始化注入
 * 7. 初始化状态
 *    7.1 初始化 props
 *    7.2 初始化 methods
 *    7.3 初始化 data
 *    7.4 初始化计算属性
 *    7.5 初始化 watch
 * 8. 初始化提供
 * 9. 调用 created 钩子
 * 10. 执行挂载操作
 * @param Vue Vue 
 */
export function initMixin (Vue: Function) {
  /**
   * 定义 _init 函数
   * @param options 组件选项
   */
  Vue.prototype._init = function (options?: Object | any) {
    const vm: Component | any = this
    // a uid
    vm._uid = uid++
    // 性能评估
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 防止 Vue 实例被观测
    vm._isVue = true
    // merge options
    // 合并选项
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // 优化内部组件实例
      // 因为动态选项合并非常缓慢，内部组件不需要特殊处理
      initInternalComponent(vm, options)
    } else {
      // 合并父子选项
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    /** 开发环境，劫持 vm 上属性的访问和遍历 */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      // 非开发环境，渲染代理就是 vm 实例本身
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化生命周期
    initLifecycle(vm)
    // 初始化事件
    initEvents(vm)
    // 初始化 render
    initRender(vm)
    // 调用 beforeCreate 钩子
    callHook(vm, 'beforeCreate')
    // 初始化注入，在初始化 data/props 前初始化注入
    initInjections(vm) // resolve injections before data/props
    // 初始化状态
    initState(vm)
    // 初始化提供，在初始化 data/props 前初始化提供
    initProvide(vm) // resolve provide after data/props
    // 调用 created 钩子
    callHook(vm, 'created')

    /* istanbul ignore if */
    // 开发环境，评估组件挂载前的 执行性能
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 如果有 el ，则挂载 el
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
/**
 * 初始化内部组件
 * @param vm 组件实例
 * @param options 内部组件选项
 */
export function initInternalComponent (vm: Component | any, options: InternalComponentOptions) {
  // 得到组件实例构造器选项，并以它为原型创建了一个对象
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}
/**
 * 从构造器解析组件选项并返回，
 * 会合并父类和子类的构造器选项
 * @param Ctor 构造器
 */
export function resolveConstructorOptions (Ctor: any) {
  // 构造器选项
  let options = Ctor.options
  // 如果有父类，解析父类构造器选项
  if (Ctor.super) {
    // 父类选项
    const superOptions = resolveConstructorOptions(Ctor.super)
    // 获取缓存的父类选项
    const cachedSuperOptions = Ctor.superOptions
    // 父类选项和缓存的父类选项不一样
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      // 缓存父类选项
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 合并父子选项
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        // 如果选项有名称，则将对应的组件沟槽其与之关联
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}
/**
 * 解析修饰符选项
 * @param Ctor 构造器
 */
function resolveModifiedOptions (Ctor: any): Object {
  let modified
  // 构造器选项
  const latest = Ctor.options
  // 密封的选项
  const sealed = Ctor.sealedOptions
  // 遍历构造器选项
  for (const key in latest) {
    // 如果构造器选项中的属性和密封的选项属性不同
    if (latest[key] !== sealed[key]) {
      // 如果没有修饰对象，创建一个
      if (!modified) modified = {}
      // 为修饰对象添加构造器选项对应的属性和值。
      modified[key] = latest[key]
    }
  }
  return modified
}
