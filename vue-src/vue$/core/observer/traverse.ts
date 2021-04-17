import { _Set as Set, isObject } from '../util/index'
import type { SimpleSet } from '../util/index'
import VNode from '../vdom/vnode'

/** 用于存储依赖 id ，判断是否已经进行过依赖收集 */
const seenObjects = new Set()

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
/**
 * 递归遍历对象，间接地调用 getter 收集依赖
 * @param val 目标对象
 */
export function traverse (val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse (val: any, seen: SimpleSet) {
  let i, keys
  const isA = Array.isArray(val)
  // 不是数组也不是对象不收集依赖，对象无法修改值或虚拟节点实例也不进行收集依赖
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  // 被观察过
  if (val.__ob__) {
    // 获取监听器 observer 的依赖实例 id
    const depId = val.__ob__.dep.id
    // 已经收集过依赖，则不必再次收集（因为 data 中的某个属性会引用 data 的其他属性，则它们属于同一引用，只收集一次依赖即可）
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  if (isA) {
    i = val.length
    while (i--) _traverse(val[i], seen)
  } else {
    keys = Object.keys(val)
    i = keys.length
    // val[keys[i]] 会触发 getter，进行依赖收集
    while (i--) _traverse(val[keys[i]], seen)
  }
}
