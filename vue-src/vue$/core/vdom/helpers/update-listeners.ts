import {
  warn,
  invokeWithErrorHandling
} from '../../util/index'
import {
  cached,
  isUndef,
  isTrue,
  isPlainObject
} from '../../../shared/util'
import { Component } from '../../../types'
/**
 * 规范化事件函数：返回一个对象，
 * 包含事件的名称，是否执行一次，是否捕获，是否被动的等信息。
 */
const normalizeEvent = cached((name: string): {
  name: string,
  once: boolean,
  capture: boolean,
  passive: boolean,
  handler?: Function,
  params?: Array<any>
} => {
  // 检测是否被动的，不会阻止默认事件， name 的第一个字符是否为 ‘&’
  const passive = name.charAt(0) === '&'
  // 获取 name
  name = passive ? name.slice(1) : name
  // 接着判断是否只执行一次， name 的第一个字符是否为 ‘~’
  const once = name.charAt(0) === '~' // Prefixed last, checked first
  // 获取 name
  name = once ? name.slice(1) : name
  // 然后判断是否要捕获， name 的第一个字符是否为 ‘!’
  const capture = name.charAt(0) === '!'
  // 获取 name
  name = capture ? name.slice(1) : name
  return {
    name,
    once,
    capture,
    passive
  }
})
/**
 * 创建函数的调用者，它是一个函数，执行时会调用挂载
 * 在它身上的 fns ， 可以捕获错误（包括异步错误）
 * @param fns 函数或函数集合
 * @param vm Vue 实例
 */
export function createFnInvoker (fns: Function | Array<Function>, vm?: Component): Function {
  // 定义调用者函数
  function invoker () {
    // 获取静态地挂载在调用者的函数或函数集合
    const fns = invoker.fns
    // 如果是函数集合
    if (Array.isArray(fns)) {
      // 浅克隆一份 fns
      const cloned = fns.slice()
      // 遍历函数集合并调用（上下文为 null ），可以 catch 错误（包含异步调用的错误）
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, <any>arguments, vm, `v-on handler`)
      }
    } else {
      // 调用 fns （上下文为 null ），可以 catch 错误（包含异步调用的错误），返回调用结果
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null,  <any>arguments, vm, `v-on handler`)
    }
  }
  // 静态挂载 fns
  invoker.fns = fns
  // 返回函数调用者
  return invoker
}
/**
 * 更新事件监听器
 * @param on 虚拟节点 data 中的 on ，键值为事件名对应的事件监听器
 * @param oldOn 旧的虚拟节点 data 中的 on
 * @param add 添加函数
 * @param remove 移除函数
 * @param createOnceHandler 创建只调用一次的函数
 * @param vm 组件实例
 */
export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  // name: 事件名（事件绑定的属性编译后的特殊的字符串，它包含了&，~，！，如: $~!click），它表示的是被动的只执行一次的捕获的click事件
  // def: 事件名对应的监听器或集合，
  // cur: 当前监听器或集合，
  // old: 老的监听器或集合，
  // event: 事件选项
  let name, def, cur, old, event
  // 遍历事件名
  for (name in on) {
    // 获取监听器
    def = cur = on[name]
    // 获取旧的监听器
    old = oldOn[name]
    // 获取事件选项
    event = normalizeEvent(name)
    /* istanbul ignore if */
    // 如果是 weex 环境并且 def 是纯对象，
    // 则 cur 改为 def.handler
    // 事件监听器的参数改为 def.params
    // @ts-ignore
    if (__WEEX__&& isPlainObject(def)) {
      cur = def.handler
      event.params = def.params
    }
    // cur 未定义，警告事件监听器绑定错误
    if (isUndef(cur)) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) {
      // 没有旧的监听器，说明是第一次渲染
      // 如果监听器没有 fns ，将 cur 赋值为函数调用者，
      // 由它来执行真正的监听器或监听器集合。
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm)
      }
      // 创建一个只执行一次事件函数的函数
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      // ???? 添加它
      add(event.name, cur, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      // 更新监听器，实际上还是调用 old ，
      // 在第一次渲染的时候，它变成了 oldOn 中
      // name 对应的函数调用者，由它来调用监听器，
      // 监听器即为 fns
      old.fns = cur
      // 新的 on 中 name 对应 old 函数调用者
      on[name] = old
    }
  }
  // 遍历旧的事件
  for (name in oldOn) {
    // 没有对应的监听器，说明可能已经被删除了哦~
    if (isUndef(on[name])) {
      // 得到事件选项
      event = normalizeEvent(name)
      // ??? 移除它
      remove(event.name, oldOn[name], event.capture)
    }
  }
}
