import config from '../../../core/config'

import {
  warn,
  isObject,
  toObject,
  isReservedAttribute,
  camelize,
  hyphenate
} from '../../../core/util/index'
import { VNodeData } from '../../../types/vnode'

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
/**
 * 对象绑定处理，编译模板的时候会用到
 * @param data 虚拟节点 data
 * @param tag 标签名
 * @param value 绑定的值
 * @param asProp 是否作为 prop 绑定
 * @param isSync 是否同步
 */
export function bindObjectProps (
  data: any,
  tag: string,
  value: any,
  asProp: boolean,
  isSync?: boolean
): VNodeData {
  // 存在绑定的值
  if (value) {
    // 不是 object 或者是 null
    if (!isObject(value)) {
      process.env.NODE_ENV !== 'production' && warn(
        'v-bind without argument expects an Object or Array value',
        this
      )
    } else {
      // 如果是数组，变为对象
      if (Array.isArray(value)) {
        value = toObject(value)
      }
      // 声明一个 hash
      let hash
      // 遍历属性
      // 这里无非就是 hash 怎么取值
      // 然后对 hash 做一些处理。
      // 如果 key 是 class 或 style 或是保留的，
      // hash 取data ，如果不是，检查是否作为 prop 
      // 或者必须使用 prop ，是则取 data.domProps ，
      // 不是则取 data.attrs
      // 然后看 hash 是否有 value 中的 key，
      // 没有则浅拷贝过来，然后判断是否有
      // sync 修饰符，有则自动绑定一个 update:xx
      // 事件
      for (const key in value) {
        // 如果是 class 或 style 或是 key,ref,slot,slot-scope,is
        // 则将 hash 赋值为 data
        if (
          key === 'class' ||
          key === 'style' ||
          isReservedAttribute(key)
        ) {
          hash = data
        } else {
          // type ，input 的 type
          // 如果是 prop 绑定或者必须使用 prop ， 
          // 则将hash 赋值为 data.domProps，如果
          // 不是必须使用 prop 则将 hash 赋值为 
          // data.attrs
          
          const type = data.attrs && data.attrs.type
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {})
        }
        // 驼峰命名
        const camelizedKey = camelize(key)
        // 连字符命名
        const hyphenatedKey = hyphenate(key)
        // 如果驼峰命名和连字符命名都不在 hash 中，
        // 为 hash 添加 key 属性，值为绑定的 value 中
        // key 对应的值。
        if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
          hash[key] = value[key]
          // 有 sync 修饰符，自动绑定一个 update:xx 事件
          if (isSync) {
            const on = data.on || (data.on = {})
            on[`update:${key}`] = function ($event) {
              value[key] = $event
            }
          }
        }
      }
    }
  }
  return data
}
