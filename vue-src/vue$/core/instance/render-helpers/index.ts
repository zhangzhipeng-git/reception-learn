/* @flow */

import { toNumber, toString, looseEqual, looseIndexOf } from '../../../shared/util'
import { createTextVNode, createEmptyVNode } from '../../vdom/vnode'
import { renderList } from './render-list'
import { renderSlot } from './render-slot'
import { resolveFilter } from './resolve-filter'
import { checkKeyCodes } from './check-keycodes'
import { bindObjectProps } from './bind-object-props'
import { renderStatic, markOnce } from './render-static'
import { bindObjectListeners } from './bind-object-listeners'
import { resolveScopedSlots } from './resolve-scoped-slots'
import { bindDynamicKeys, prependModifier } from './bind-dynamic-keys'
/**
 * 给目标对象安装一些渲染助手
 * @param target 目标对象
 */
export function installRenderHelpers (target: any) {
  /** 标记虚拟节点数只进行一次数据绑定和标记它是静态的 */
  target._o = markOnce
  /** 变成数字 */
  target._n = toNumber
  /** 转为字符串 */
  target._s = toString
  /** v-for 渲染列表助手，返回虚拟节点数组 */
  target._l = renderList
  /** 插槽渲染助手，分为作用域插槽（name 对应的是虚拟节点）和非作用域插槽（name 对应的函数，它会生成虚拟节点，可以传入 props） */
  target._t = renderSlot
  /** 判断是否长得一样 */
  target._q = looseEqual
  /** 判断集合中是否有和目标元素长得一样的元素，并返回下标，没找到就返回 -1 */
  target._i = looseIndexOf
  /** 静态虚拟节点树渲染，可缓存复用 */
  target._m = renderStatic
  /** 根据过滤器 id 解析出对应的过滤器函数 */
  target._f = resolveFilter
  /** 检查键码 */
  target._k = checkKeyCodes
  /** 绑定对象形式的 props */
  target._b = bindObjectProps
  /** 创建空的虚拟文本节点 */
  target._v = createTextVNode
  /** 创建空的虚拟节点，并标记为注释节点 */
  target._e = createEmptyVNode
  /** 解析作用域插槽 */
  target._u = resolveScopedSlots
  /** 绑定对象时的事件监听器，多个事件组合的对象 */
  target._g = bindObjectListeners
  /** 绑定动态属性 */
  target._d = bindDynamicKeys
  
  target._p = prependModifier
}
