// helper to process dynamic keys for dynamic arguments in v-bind and v-on.
// For example, the following template:
//
// <div id="app" :[key]="value">
//
// compiles to the following:
//
// _c('div', { attrs: bindDynamicKeys({ "id": "app" }, [key, value]) })

import { warn } from '../../util/debug'
/**
 * <div id="app" :[key]="value"> 编译成：
 * _c('div', { attrs: bindDynamicKeys({ "id": "app" }, [key, value]) })
 * 
 * 将动态属性键值浅拷贝到 baseObj 上，
 * 当 key 变化时，应该会重新调用这个函数
 * @param baseObj 属性对象，如 {"id": "app"}
 * @param values 动态属性键和它对应的值构成的数组，如 [key1, value1, key2, value2]
 */
export function bindDynamicKeys (baseObj: Object, values: Array<any>): Object {
  for (let i = 0; i < values.length; i += 2) {
    const key = values[i]
    if (typeof key === 'string' && key) {
      // baseObj[key] = value
      baseObj[values[i]] = values[i + 1]
    } else if (process.env.NODE_ENV !== 'production' && key !== '' && key !== null) {
      // null is a special value for explicitly removing a binding
      warn(
        `Invalid value for dynamic directive argument (expected string or null): ${key}`,
        this
      )
    }
  }
  return baseObj
}

// helper to dynamically append modifier runtime markers to event names.
// ensure only append when value is already string, otherwise it will be cast
// to string and cause the type check to miss.
export function prependModifier (value: any, symbol: string): any {
  return typeof value === 'string' ? symbol + value : value
}
