/* @flow */

import { VNodeData } from '../../../types/vnode'
import { warn, extend, isPlainObject } from '../../util/index'
/**
 * 绑定对象式的事件监听器，如 v-on="{event1: callback, event2: callback, ...}"
 * @param data 虚拟节点 data
 * @param value 绑定对象
 */
export function bindObjectListeners (data: any, value: any): VNodeData {
  if (value) {
    // 既然是绑定对象式的监听器，那么 value 必须是纯对象
    if (!isPlainObject(value)) {
      process.env.NODE_ENV !== 'production' && warn(
        'v-on without argument expects an Object value',
        this
      )
    } else {
      // 是对象形式
      const on = data.on = data.on ? extend({}, data.on) : {}
      // 获取 on 上收集的监听器，遍历绑定对象，key 是事件名
      for (const key in value) {
        const existing = on[key]
        const ours = value[key]
        // 存在之前绑定的监听器则合并新加入的监听器，否则直接赋值为新的监听器
        on[key] = existing ? [].concat(existing, ours) : ours
      }
    }
  }
  return data
}
