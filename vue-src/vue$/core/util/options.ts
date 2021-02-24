import config from '../config'
import { warn } from './debug'
import { set } from '../observer/index'
import { unicodeRegExp } from './lang'
import { nativeWatch, hasSymbol } from './env'

import {
  ASSET_TYPES,
  LIFECYCLE_HOOKS
} from '../../shared/constants'

import {
  extend,
  hasOwn,
  camelize,
  toRawType,
  capitalize,
  isBuiltInTag,
  isPlainObject
} from '../../shared/util'
import { Component, ComponentOptions } from '../../types/options'
import { Vue } from '../../types/vue'

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
/** 选项合并策略，默认从配置取 */
const strats = config.optionMergeStrategies

/**
 * Options with restrictions
 */
/**
 * 开发环境时，将合并策略的
 * el 和 propsData （prop 选项集合） 赋值为一个函数
 * 该函数返回一个默认的策略函数的结果值(当子选项值不存在时，返回父选项值)
 */
if (process.env.NODE_ENV !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    // 如果没有传入 vm 实例，则警告选项的键被实例化的 vm 使用
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }
}

/**
 * Helper that recursively merges two data objects together.
 */
/**
 * 遍历源对象的属性，如果目标对象没有这个属性，
 * 则将源对象的属性值响应式地设置到目标对象
 * 如果属性值是一个对象，则递归
 * @param to 目标对象
 * @param from 源对象
 */
function mergeData (to: Object, from?: Object): Object {
  // 没有源对象，直接返回目标对象
  if (!from) return to
  let key, toVal, fromVal

  const keys = hasSymbol
    ? Reflect.ownKeys(from) // 包括不可枚举属性
    : Object.keys(from) // 不包括不可枚举属性

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    // in case the object is already observed...
    // 如果该对象已经被观察过了，它的 __ob__ 不变
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      // 如果目标对象没有这个属性，
      // 就将源对象的属性和值响应式地添加到目标对象
      set(to, key, fromVal)
    } else if (
      // 如果有目标对象有这个属性，则判断是否不相等并且都是纯对象，
      // 如果是则递归合并 data
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * Data
 */
/**
 * 合并 data 或者 函数
 * @param parentVal 父选项的 data 
 * @param childVal 子选项的 data 
 * @param vm 组件实例
 */
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): Function {
  // 如果 组件实例不存在
  if (!vm) { 
    // in a Vue.extend merge, both should be functions
    // 如果子选项的 data 不存在，返回父选项的 data 
    if (!childVal) {
      return parentVal
    }
    // 如果父选项的 data 不存在，则返回子选项的 data 
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    // 如果父选项和子选项的 data 都是存在的，返回一个函数：
    // 如果父、子选项的 data 是函数，则执行函数得到各自的 data 然后合并返回
    // 这个父选项的 data 必须是一个函数，因为它是父类的选项，如果不是 data 工厂函数，则所有子类选项共用它的 data
    // 另外，如果是组件，那么它的 data 也必须是一个函数，返回一个新的 data
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    // 如果存在 组件实例vm
    // 判断子选项得到的 data 是否存在，存在则将父选项得到的 data 和它合并后返回
    // 不存在则返回父选项得到的 data
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}
/**
 * 合并父、子选项的 data
 * @param parentVal 父选项的 data
 * @param childVal 子选项的 data
 * @param vm 组件实例
 */
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): Function {
  // 如果实例不存在
  if (!vm) {
    // 如果子选项的 data 存在并且不是函数，则警告它不是一个函数
    // 并返回父选项的 data
    if (childVal && typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )

      return parentVal
    }
    // 如果子选项的 data 是函数，则合并父选项的 data 和子选项的 data
    return mergeDataOrFn(parentVal, childVal)
  }
  // 存在 vm
  return mergeDataOrFn(parentVal, childVal, vm)
}

/**
 * Hooks and props are merged as arrays.
 */
/**
 * 合并父子钩子
 * 子钩子不存在，返回父钩子
 * 子钩子存在，判断父钩子是否存在，若存在返回父钩子和子钩子连接的集合，
 * 若不存在，返回子钩子
 * @param parentVal 父钩子
 * @param childVal 子钩子
 */
function mergeHook (
  parentVal: Array<Function>,
  childVal?: Function | Array<Function>
): Array<Function> {
  const res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
  return res
    ? dedupeHooks(res)
    : res
}
/**
 * 去重钩子集合
 * @param hooks 钩子函数集合
 */
function dedupeHooks (hooks) {
  const res = []
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i])
    }
  }
  return res
}
/**
 * 将策略的12个钩子变成一个合并父子钩子的函数
 */
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
/**
 * 合并构造器选项，实例选项，和父类选项
 * @param parentVal 父选项
 * @param childVal 子选项
 * @param vm 组件实例
 * @param key 选项的属性
 */
function mergeAssets (
  parentVal: Object,
  childVal: Object,
  vm?: Component,
  key?: string
): Object {
  // 创建一个对象，如果父选项存在，则它的原型为父选项
  const res = Object.create(parentVal || null)
  if (childVal) {
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
/**
 * 观察者不应该被覆盖，应该被合并
 * @param parentVal 父观察者
 * @param childVal 子观察者
 * @param vm 组件实例
 * @param key 选项属性值
 */
strats.watch = function (
  parentVal: Object,
  childVal: Object,
  vm?: Component,
  key?: string
): Object {
  // work around Firefox's Object.prototype.watch...
  // 如果观察者和原生的 firefox 浏览器观察函数相同，
  // 则将它们置为 undefined
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  // 如果子观察者不存在，则以父观察者为原型创建一个新的对象
  if (!childVal) return Object.create(parentVal || null)
  // 检查选项的属性 key 对应的 childVal 是不是对象
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  // 没有父观察者，返回子观察者
  if (!parentVal) return childVal
  const ret = {}
  // 将父观察者的属性复制到 ret 上
  extend(ret, parentVal)
  // 遍历子观者者的属性
  for (const key in childVal) {
    // 父观察者对应的属性值
    let parent = ret[key]
    // 子观察者对应的属性值
    const child = childVal[key]
    // 如果父观察者不是数组，则变为数组
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    // 连接父和子观察者的属性值存到 ret 上，并且变为一个数组集合
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}

/**
 * Other object hashes.
 */
/**
 * 其他的一些对象，如 props ，methods，inject，computed
 * 父值不存在，则返回子值
 * 父值存在，则合并父值和子值（存在覆盖）
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: Object,
  childVal: Object,
  vm?: Component,
  key?: string
): Object {
  // 检查选项中 key 对应的 childVal 是不是对象，不是则警告
  if (childVal && process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  // 父值不存在，返回子值
  if (!parentVal) return childVal
  // 创建一个没有原型的空对象，不是 Object 的实例
  const ret = Object.create(null)
  // 将父值的属性都复制到 ret 上
  extend(ret, parentVal)
  // 如果子值存在，则子值属性对应的值覆盖 ret 中父值的属性对应的值
  if (childVal) extend(ret, childVal)
  return ret
}
// “提供函数” = mergeDataOrFn
strats.provide = mergeDataOrFn

/**
 * Default strategy.
 */
/**
 * 当子值不存在时，返回父值
 * @param parentVal 父值
 * @param childVal 子值
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Validate component names
 */
/**
 * 校验组件的选项中的 components 集合的组件名是否有效
 * @param options 组件选项
 */
function checkComponents (options: ComponentOptions<Vue>) {
  for (const key in options.components) {
    validateComponentName(key)
  }
}
/**
 * 校验组件名称
 */
export function validateComponentName (name: string) {
  // 不是有效的组件名
  if (!new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    )
  }
  // 检查是不是slot 或 component 或 保留的标签，是则警告
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    )
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
/**
 * 将 props 选项语法变为基于对象的格式
 * 如果 props 是数组
 * ['name1'] => {name1: {type: null}} 
 * 如果 props 是纯对象
 * { name1: Boolean } => { name1: {type: Boolean} }
 * { name1: {type: Boolean} } => {name1: {type: Boolean} }
 * @param options 规范化 props
 * @param vm 组件实例
 */
function normalizeProps (options: ComponentOptions<Vue>, vm: Component) {
  const props = options.props
  if (!props) return
  // 定义结果对象，存放 props 键值
  const res = {}
  let i, val, name
  // props 是数组时，每个元素都必须是字符串
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    // 是纯对象时，遍历对象
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    // props 不是对象或者数组则警告
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}

/**
 * Normalize all injections into Object-based format
 */
/**
 * 将 inject 选项语法变为基于对象的格式
 * 如果 inject 是字符串数组
 * ['name1'] => {name1: {from: 'name1'}}
 * 如果 inject 是纯对象
 * {name1: 'name2' } => {name1: {from: 'name2'}}
 * {name1: {from?: 'name2', default?: xx}} => {name1: {from:'name2', default?: xx}}
 * @param options 组件选项
 * @param vm 组件实例
 */
function normalizeInject (options: ComponentOptions<Vue>, vm?: Component) {
  // 拿到注入
  const inject = options.inject
  if (!inject) return
  // 规范化结果
  const normalized = options.inject = {}
  // “注入” 是一个数组
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
  } else if (isPlainObject(inject)) {
    // 是纯对象
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, <object>val)
        : { from: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    // 不是数组或对象
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}

/**
 * Normalize raw function directives into object format.
 */
/**
 * 规范化指令
 * 如果指令是函数，则变成对象
 * @param options 组件选项
 */
function normalizeDirectives (options: Object) {
  // @ts-ignore
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}
/**
 * 检查选项的某个属性值是否对象，不是则警告
 * @param name 选项属性
 * @param value 值
 * @param vm 组件实例
 */
function assertObjectType (name: string, value: any, vm?: Component) {
  if (!isPlainObject(value)) {
    warn(
      `Invalid value for option "${name}": expected an Object, ` +
      `but got ${toRawType(value)}.`,
      vm
    )
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
/**
 * 合并父子选项，并返回合并后的的选项对象
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    // @ts-ignore
    child = child.options
  }
  // 规范化 props
  normalizeProps(child, vm)
  // 规范化 inject
  normalizeInject(child, vm)
  // 规范化 指令
  normalizeDirectives(child)

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  // @ts-ignore
  if (!child._base) {
    // @ts-ignore
    if (child.extends) {
      // @ts-ignore
      parent = mergeOptions(parent, child.extends, vm)
    }
    // @ts-ignore
    if (child.mixins) {
      // @ts-ignore
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        // @ts-ignore
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  // 合并父选项的属性值
  for (key in parent) {
    mergeField(key)
  }
  // 如果父选项中没有子选项的属性，则合并父选项和子选项对应的属性值
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  /**
   * 合并父子选项属性 key 的值
   * @param key 选项的属性 key
   */
  function mergeField (key) {
    // 得到 key 对应的合并策略，并执行。
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
/**
 * 根据类型 type 解析选项的 id 对应的值并返回
 * @param options 组件选项
 * @param type 类型
 * @param id id
 * @param warnMissing 是否不警告 
 */
export function resolveAsset (
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  // check local registration variations first
  // 首先检查本地注册的变化
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}
