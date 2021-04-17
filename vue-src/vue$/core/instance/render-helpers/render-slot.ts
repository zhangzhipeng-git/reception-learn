import { extend, warn, isObject } from '../../util/index'
import { VNode } from '../../../types/vnode'

/**
 * Runtime helper for rendering <slot>
 */
/**
 * 插槽渲染助手，返回虚拟节点数组
 * @param name 插槽名称
 * @param fallback 虚拟节点数组
 * @param props props
 * @param bindObject 绑定的对象
 */
export function renderSlot (
  name: string,
  fallback: Array<VNode>,
  props: Object | any,
  bindObject: Object
): Array<VNode> {
  // 范围插槽函数
  const scopedSlotFn = this.$scopedSlots[name]
  // 虚拟节点
  let nodes
  // 范围插槽函数，$scopedSlots 中 name 对应的插槽是一个函数
  if (scopedSlotFn) { // scoped slot
    props = props || {}
    // 绑定对象须是一个对象，范围插槽向投影过来的内容注入 props
    // 
    if (bindObject) {
      if (process.env.NODE_ENV !== 'production' && !isObject(bindObject)) {
        warn(
          'slot v-bind without argument expects an Object',
          this
        )
      }
      // props 继承绑定对象
      props = extend(extend({}, bindObject), props)
    }
    // 虚拟节点为范围插槽函数的执行结果，不存在就赋值为传入的虚拟节点数组
    nodes = scopedSlotFn(props) || fallback
  } else {
    // 没找到对应的范围插槽函数，则取非范围插槽
    nodes = this.$slots[name] || fallback
  }
  // props 中的 slot
  const target = props && props.slot
  // 如果有插槽则创建对应的插槽虚拟节点并返回
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    // 没有插槽直接返回虚拟节点数组
    return nodes
  }
}
