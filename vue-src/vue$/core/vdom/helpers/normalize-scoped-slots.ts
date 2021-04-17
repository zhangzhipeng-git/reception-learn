/* @flow */

import { def } from '../../util/lang'
import { normalizeChildren } from '../../vdom/helpers/normalize-children'
import { emptyObject } from '../../../shared/util'
import { VNode } from '../../../types'
/**
 * 规范化插槽
 * @param slots 虚拟节点 data 属性上 scopedSlots
 * @param normalSlots 普通的插槽
 * @param prevSlots 之前的插槽
 */
export function normalizeScopedSlots (
  slots: { [key: string]: Function } | void,
  normalSlots: { [key: string]: Array<VNode> },
  prevSlots?: { [key: string]: Function } | void
): any {
  /** 返回结果 */
  let res
  /** 有普通插槽 */
  const hasNormalSlots = Object.keys(normalSlots).length > 0
  /** 
   * 如果有作用域插槽，则取作用域插槽的 $stable （有动态 key 则不稳定）
   * 如果没有作用域插槽，则判断是否有普通插槽，有则不是稳定的
   */
  const isStable = slots ? !!slots.$stable : !hasNormalSlots
  /** 取作用域插槽对象的 $key */
  const key = slots && slots.$key
  // 不存在作用域插槽
  if (!slots) {
    res = {}
  } else if (slots._normalized) { // 插槽
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized
  } else if (
    isStable &&
    prevSlots &&
    prevSlots !== emptyObject &&
    key === prevSlots.$key &&
    !hasNormalSlots &&
    !prevSlots.$hasNormal
  ) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots
  } else {
    res = {}
    for (const key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = normalizeScopedSlot(normalSlots, key, slots[key])
      }
    }
  }
  // expose normal slots on scopedSlots
  for (const key in normalSlots) {
    if (!(key in res)) {
      res[key] = proxyNormalSlot(normalSlots, key)
    }
  }
  // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error
  if (slots && Object.isExtensible(slots)) {
    (slots: any)._normalized = res
  }
  def(res, '$stable', isStable)
  def(res, '$key', key)
  def(res, '$hasNormal', hasNormalSlots)
  return res
}

function normalizeScopedSlot(normalSlots, key, fn) {
  const normalized = function () {
    let res = arguments.length ? fn.apply(null, arguments) : fn({})
    res = res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res)
    return res && (
      res.length === 0 ||
      (res.length === 1 && res[0].isComment) // #9658
    ) ? undefined
      : res
  }
  // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.
  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    })
  }
  return normalized
}

function proxyNormalSlot(slots, key) {
  return () => slots[key]
}
