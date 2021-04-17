import { ScopedSlotsData } from "../../../types"
/**
 * 作用域插槽渲染前置处理，和非作用域插槽前置处理返回的不一样，
 * 它返回的是 name 对应的 fn ，fn 调用后才会生成虚拟节点：
 * {
 *    $stable: !hasDynamicKeys, // 是否有动态的 name
 *    name1: fn1,
 *    name2: fn2,
 *    $key?: contentHashKey // 可能没有 $key
 * }
 * @param fns 作用域插槽函数对象集合（是组合模式，所以这里是递归调用的），
 * 每个对象的 key 为插槽名 name
 * @param res 返回的对象结果
 * @param hasDynamicKeys 是否有动态 key
 * @param contentHashKey ？
 */
export function resolveScopedSlots (
  fns: ScopedSlotsData, // see flow/vnode
  res?: Object,
  // the following are added in 2.6
  hasDynamicKeys?: boolean,
  contentHashKey?: number
): { [key: string]: Function | boolean, $stable: boolean } {
  // 没有动态的 key 即为稳固的
  res = res || { $stable: !hasDynamicKeys } 
  for (let i = 0; i < fns.length; i++) {
    const slot = fns[i] as any;
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys)
    } else if (slot) {
      // 标记反向代理（）
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true
      }
      res[slot.key] = slot.fn
    }
  }
  if (contentHashKey) {
    (res as any).$key = contentHashKey
  }
  return res as any
}
