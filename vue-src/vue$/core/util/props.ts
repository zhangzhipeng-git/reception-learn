// @ts-nocheck
import { warn } from './debug'
import { observe, toggleObserving, shouldObserve } from '../observer/index'
import {
  hasOwn,
  isObject,
  toRawType,
  hyphenate,
  capitalize,
  isPlainObject
} from '../../shared/util';
import { Component } from '../../types/options';
/** props 选项 */
type PropOptions = {
  type: Function | Array<Function> | null,
  default: any,
  required?: boolean,
  validator?: Function
};
/**
 * 校验 prop
 * @param key 输入的属性名
 * @param propOptions props 选项，包含输入属性键值 
 * @param propsData 
 * @param vm Vue 实例
 */
export function validateProp (
  key: string,
  propOptions: Object,
  propsData: Object,
  vm?: Component
): any {
  // prop 键对应的选项（包含类型[可以是数组]，默认值，校验器）
  const prop = propOptions[key]
  // 不存在 prop 键的值
  const absent = !hasOwn(propsData, key)
  // prop 键对应的值
  let value = propsData[key]
  // boolean casting
  // 检查 prop 键对应的选项的类型是否包含布尔类型
  const booleanIndex = getTypeIndex(Boolean, prop.type)
  // 如果类型中包含了布尔值，
  if (booleanIndex > -1) {
      // 但是没给初始值和默认值，则将 prop 值赋值为 false
    if (absent && !hasOwn(prop, 'default')) {
      value = false
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      // 如果类型包含 Boolean 但不包含 String，或者布尔类型在字符串类型的前面
      // 并且 prop 值为空字符串或者是 prop 键的连字符形式
      // 则将 prop 值 赋值为 true
      const stringIndex = getTypeIndex(String, prop.type)
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true
      }
    }
  }
  // check default value
  // 如果 prop 的值还是没有
  if (value === undefined) {
    // 获取默认值
    value = getPropDefaultValue(vm, prop, key)
    // since the default value is a fresh copy,
    // make sure to observe it.
    // 因为获取默认值时会返回新的对象或其他值，这里尝试监听它设为响应式
    const prevShouldObserve = shouldObserve
    toggleObserving(true)
    observe(value)
    toggleObserving(prevShouldObserve)
  }
  // weex 下的开发环境，当 value 是一个对象并且包含 @binding 属性
  if (
    process.env.NODE_ENV !== 'production' &&
    // skip validation for weex recycle-list child component props
    !(__WEEX__ && isObject(value) && ('@binding' in value))
  ) {
    assertProp(prop, key, value, vm, absent)
  }
  return value
}

/**
 * Get the default value of a prop.
 */
/**
 * 获取 prop 键对应的默认值
 * @param vm Vue 实例
 * @param prop prop 的选项
 * @param key prop 的键
 */
function getPropDefaultValue (vm: Component, prop: PropOptions, key: string): any {
  // no default, return undefined
  // 没有提供默认值，返回未定义
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  const def = prop.default
  // prop 的 默认值必须是工厂函数
  // warn against non-factory defaults for Object & Array
  if (process.env.NODE_ENV !== 'production' && isObject(def)) {
    warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    )
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  // 如果 prop 已经被观察过了，直接返回之前的 prop 值
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  // 如果默认值是一个函数，则执行它（并将 vm 作为它的上下文）
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
/**
 * 断言 prop
 * @param prop prop 选项
 * @param name prop 键名
 * @param value prop 键值
 * @param vm Vue 实例
 * @param absent 不存在
 */
function assertProp (
  prop: PropOptions,
  name: string,
  value: any,
  vm: Component,
  absent: boolean
) {
    // 提示必须存在时却不存在
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    )
    return
  }
  if (value == null && !prop.required) {
    return
  }
  let type = prop.type
  // type 为'',false,0,true,undefined 时为有效
  let valid = !type || type === true
  const expectedTypes = []
  if (type) {
    // type 不为数组则变为数组
    if (!Array.isArray(type)) {
      type = [type]
    }
    for (let i = 0; i < type.length && !valid; i++) {
      const assertedType = assertType(value, type[i])
      expectedTypes.push(assertedType.expectedType || '')
      valid = assertedType.valid
    }
  }
  // 如果不是有效的，则提示无效
  if (!valid) {
    warn(
      getInvalidTypeMessage(name, value, expectedTypes),
      vm
    )
    return
  }
  // 使用传入的校验器校验是否有效
  const validator = prop.validator
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      )
    }
  }
}
/** /^(String|Number|Boolean|Function|Symbol)$/ */
const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/

/**
 * 断言类型
 * @param value prop 值
 * @param type prop 选项中遍历的类型
 */
function assertType (value: any, type: Function): {
  valid: boolean;
  expectedType: string;
} {
  let valid
  const expectedType = getType(type)
  // 如果是 String，Number，Boolean，Symbol，Function 中的一种
  if (simpleCheckRE.test(expectedType)) {
      // 判断 prop 的 value 是否符合类型
    const t = typeof value
    valid = t === expectedType.toLowerCase()
    // for primitive wrapper objects
    // 判断 value 是否上述类型(除了 Symbol 和 Function ) new 出来的
    // typeof true === 'boolean'
    // typeof Boolean('true') === 'boolean'
    // typeof new Boolean('true') === 'object'
    if (!valid && t === 'object') {
      valid = value instanceof type
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value)
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value)
  } else {
    valid = value instanceof type
  }
  // 返回有效值和类型
  return {
    valid,
    expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
/**
 * 获取类型（用fn实例化后的对象的类型，即 fn 的名称）
 * @param fn 函数
 */
function getType (fn) {
  const match = fn && fn.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

/**
 * 比较类型 a 和类型 b 的名称是否相等
 * @param a 类型 a
 * @param b 类型 b
 */
function isSameType (a, b) {
  return getType(a) === getType(b)
}
/**
 * 检查 expectedTypes 中是否包含 type
 * @param type 第一个类型（构造函数名称）
 * @param expectedTypes 类型集合或单个类型
 */
function getTypeIndex (type, expectedTypes): number {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (let i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}

function getInvalidTypeMessage (name, value, expectedTypes) {
  let message = `Invalid prop: type check failed for prop "${name}".` +
    ` Expected ${expectedTypes.map(capitalize).join(', ')}`
  const expectedType = expectedTypes[0]
  const receivedType = toRawType(value)
  const expectedValue = styleValue(value, expectedType)
  const receivedValue = styleValue(value, receivedType)
  // check if we need to specify expected value
  if (expectedTypes.length === 1 &&
      isExplicable(expectedType) &&
      !isBoolean(expectedType, receivedType)) {
    message += ` with value ${expectedValue}`
  }
  message += `, got ${receivedType} `
  // check if we need to specify received value
  if (isExplicable(receivedType)) {
    message += `with value ${receivedValue}.`
  }
  return message
}

function styleValue (value, type) {
  if (type === 'String') {
    return `"${value}"`
  } else if (type === 'Number') {
    return `${Number(value)}`
  } else {
    return `${value}`
  }
}

function isExplicable (value) {
  const explicitTypes = ['string', 'number', 'boolean']
  return explicitTypes.some(elem => value.toLowerCase() === elem)
}

function isBoolean (...args) {
  return args.some(elem => elem.toLowerCase() === 'boolean')
}
