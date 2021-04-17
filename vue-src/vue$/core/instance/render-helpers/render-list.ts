import { VNode } from '../../../types/vnode'
import { isObject, isDef, hasSymbol } from '../../util/index'

/**
 * Runtime helper for rendering v-for lists.
 */
/**
 * v-for 渲染列表，返回虚拟节点数组
 * @param val 字符串或数组或数字或对象
 * @param render render 函数
 */
export function renderList (
  val: any,
  render: (
    val: any,
    keyOrIndex: string | number,
    index?: number
  ) => VNode
): Array<VNode> {
  let ret: Array<VNode>, i, l, keys, key
  // 循环字符串或数组
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length)
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i)
    }
  } else if (typeof val === 'number') {
    // 循环数字，如：v-for="i in 10"
    ret = new Array(val)
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i)
    }
  } else if (isObject(val)) {
    // 循环对象
    // 如果支持 Symbol 那么可以得到对象的迭代器
    // 因为 ES 对象是一种 Map 结构，Set 可以由 Map 
    // 实现，和 Java 一样，它们有迭代器。
    if (hasSymbol && val[Symbol.iterator]) {
      ret = []
      const iterator: Iterator<any> = val[Symbol.iterator]()
      let result = iterator.next()
      while (!result.done) {
        ret.push(render(result.value, ret.length))
        result = iterator.next()
      }
    } else {
      // 不支持 Symbol
      keys = Object.keys(val)
      ret = new Array(keys.length)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        ret[i] = render(val[key], key, i)
      }
    }
  }
  // val 不是上述中的类型，虚拟节点数组为一个空数组。
  if (!isDef(ret)) {
    ret = []
  }
  // 标记它使用 v-for 渲染
  (<any>ret)._isVList = true
  return ret
}
