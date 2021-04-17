import VNode from '../vnode'
import { createFnInvoker } from './update-listeners'
import { remove, isDef, isUndef, isTrue } from '../../../shared/util'

/**
 * 合并虚拟节点的钩子
 * 
 * 向虚拟节点 data 的 hook 对象上添加 hookKey 
 * 对应的 invoker ， invoker 不存在则创建，有则将 hookKey
 * 对应的 hook 放到 invoker 的 fns 中，这里所有的钩子只会
 * 被调用一次，它不会常驻在 invokver 中的 fns中，调用一次后
 * 便从 fns 中移除，从而避免内存泄漏。
 * @param def 虚拟节点或者虚拟节点 data 的 hook 对象 
 * @param hookKey 钩子函数名
 * @param hook 钩子函数
 */
export function mergeVNodeHook (def: Object, hookKey: string, hook: Function) {
  // 如果 def 是虚拟节点，将 def 赋值为钩子对象
  if (def instanceof VNode) {
    def = (<any>(def.data)).hook || ((<any>(def.data)).hook = {})
  }
  // 函数调用者
  let invoker
  // 根据钩子名称获取钩子，作为老的钩子，它是函数调用者
  const oldHook = def[hookKey]
  // 包装钩子的一个函数，调用钩子
  function wrappedHook () {
    hook.apply(this, arguments)
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook)
  }
  // 未定义的钩子，创建一个 invoker （函数调用者）
  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook])
  } else {
    /* istanbul ignore if */
    // 如果 hookKey 对应的 invoker 已被合并到了 def 上，
    // 下次添加新钩子的时候便直接往 invoker 的 fns 中添加 hook 即可
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook
      invoker.fns.push(wrappedHook)
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook])
    }
  }

  invoker.merged = true
  def[hookKey] = invoker
}
