/* @flow */

import { Component, VNodeData } from '../../../types'
import { ComponentOptions } from '../../../../vue/types/options';
import {
  tip,
  hasOwn,
  isDef,
  isUndef,
  hyphenate,
  formatComponentName
} from '../../util/index'
/**
 * 从虚拟节点 data 中提取 props，
 * 从组件函数的 props 选项中找到
 * 和虚拟节点 data 中 props 或 attrs 
 * 一样的属性，将他浅拷贝到 res （返回结果）上，
 * 同时删除虚拟节点 data 中 attrs 对应的这个属性。
 * @param data 虚拟节点 data
 * @param Ctor 组件函数
 * @param 标签名
 */
export function extractPropsFromVNodeData (
  data: VNodeData,
  Ctor: (options?: ComponentOptions<any>) => Component,
  tag?: string
): Object {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  // 从组件函数的选项中获取 props 
  const propOptions = (<any>Ctor).options.props
  if (isUndef(propOptions)) {
    return
  }
  // 返回结果
  const res = {}
  // 从虚拟节点 data 中解构出 attrs 和 props
  const { attrs, props } = data
  // attrs 或者 props 存在
  if (isDef(attrs) || isDef(props)) {
    // 遍历 props 选项
    for (const key in propOptions) {
      // 获取连字符的 key ， 如果 key 中没有大写字母，那么返回的值和 key 一样
      const altKey = hyphenate(key)
      // 开发模式下
      // 如果 key 和它的小写不等，并且 attrs 中有 key 小写对应的属性
      // 则警告不应该使用驼峰式命名 如：v-bind:userName ，他会建议改写为
      // 连字符形式：v-bind:user-name。
      if (process.env.NODE_ENV !== 'production') {
        // key 变小写
        const keyInLowerCase = key.toLowerCase()
        if (
          key !== keyInLowerCase &&
          attrs && hasOwn(attrs, keyInLowerCase)
        ) {
          tip(
            `Prop "${keyInLowerCase}" is passed to component ` +
            `${formatComponentName(tag || Ctor)}, but the declared prop name is` +
            ` "${key}". ` +
            `Note that HTML attributes are case-insensitive and camelCased ` +
            `props need to use their kebab-case equivalents when using in-DOM ` +
            `templates. You should probably use "${altKey}" instead of "${key}".`
          )
        }
      }
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false)
    }
  }
  return res
}
/**
 * 检查 prop ， 删除 attrs 中对应的 key 属性或 altKey 属性
 * attrs 中不包括 props 中的属性
 * @param res 上面函数传入的 res
 * @param hash props 或 attrs
 * @param key 属性名
 * @param altKey 连字符形式的 key ， key 中没有大写字母时和 key 是一样的
 * @param preserve props 为 true ， attrs 为 false
 */
function checkProp (
  res: Object,
  hash: Object,
  key: string,
  altKey: string,
  preserve: boolean
): boolean {
  // 存在 attrs 或 props
  if (isDef(hash)) {
    // attrs 或 props 中有组件函数 props 选项中的 key 对应的属性
    if (hasOwn(hash, key)) {
      res[key] = hash[key]
      // attrs 中删除 key 对应的属性
      if (!preserve) {
        delete hash[key]
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      // attrs 或 props 中有组件函数 props 选项中 key 转为连字符后对应的属性
      res[key] = hash[altKey]
      // attrs 中删除 altKey 对应的属性
      if (!preserve) {
        delete hash[altKey]
      }
      return true
    }
  }
  // 没有 props 或普通属性 attrs
  return false
}
