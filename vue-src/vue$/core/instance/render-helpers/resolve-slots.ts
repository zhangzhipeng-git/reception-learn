import { Component } from '../../../types'
import type VNode from '../../vdom/vnode'

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
/**
 * 渲染非作用域插槽前置处理，将未处理的虚拟节点变为 slot 对象，
 * 返回 name 对应的虚拟节点：
 * {
 *    name1: [vn, vn, ...],
 *    name2: [vn, vn, ...],
 *    default: [vn, vn, ...]
 * }
 * @param children 虚拟节点集合
 * @param context 渲染插槽上下文
 */
export function resolveSlots (
  children: Array<VNode>,
  context: Component
): { [key: string]: Array<VNode> } {
  // 没有虚拟节点，返回一个空对象
  if (!children || !children.length) {
    return {}
  }
  // 定义一个 slots
  const slots: any = {}
  // 遍历虚拟节点数组
  for (let i = 0, l = children.length; i < l; i++) {
    // 虚拟节点
    const child = children[i]
    // 虚拟节点 data
    const data = child.data
    // remove slot attribute if the node is resolved as a Vue slot node
    // 如果 data 中有 slot 属性，则删除它
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    // 如果这里的虚拟节点的渲染上下文和传入的上下文一致
    // 并且虚拟节点中 data 的 slot 存在，这里的 data.slot 是插槽名称
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      const name = data.slot
      const slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || [])
      } else {
        slot.push(child)
      }
    } else { // 默认插槽
      (slots.default || (slots.default = [])).push(child)
    }
  }
  // ignore slots that contains only whitespace
  // 删除空白插槽
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name]
    }
  }
  // 返回具名插槽对应的虚拟节点对象
  return slots
}
/**
 * 是否空白节点或注释节点（不是异步的）
 * @param node 虚拟节点
 */
function isWhitespace (node: VNode): boolean {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}
