import { VNode } from "../../../types/vnode"

/**
 * Runtime helper for rendering static trees.
 */
/**
 * 静态渲染，可复用，带缓存
 * @param index 缓存对象在缓存数组中的下标
 * @param isInFor 是否在 v-for 中
 */
export function renderStatic (
  index: number,
  isInFor: boolean
): VNode | Array<VNode> {
  // 得到静态树缓存数组
  const cached = this._staticTrees || (this._staticTrees = [])
  // 如果有被缓存的虚拟节点树，并且不再 v-for 中，则直接将该树返回
  let tree = cached[index]
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  if (tree && !isInFor) {
    return tree
  }
  // 否则，渲染这棵树并缓存
  // otherwise, render a fresh tree.
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  )
  // 标记这棵树是静态的，数据只会初始化一次
  markStatic(tree, `__static__${index}`, false)
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
/**
 * 标记该树只渲染一次，即使有数据绑定，也只会发生第一次数据绑定，
 * 后续的数据变化，不会引起树的状态改变
 * @param tree 虚拟节点树
 * @param index 虚拟节点树的下标
 * @param key 虚拟节点的 key
 */
export function markOnce (
  tree: VNode | Array<VNode>,
  index: number,
  key: string
) {
  markStatic(tree, `__once__${index}${key ? `_${key}` : ``}`, true)
  return tree
}
/**
 * 标记树中是静态的
 * @param tree 虚拟节点树
 * @param key 唯一的 key
 * @param isOnce 是否只渲染一次，即数据绑定只有第一次生效，后续改变无效
 */
function markStatic (
  tree: VNode | Array<VNode>,
  key: string,
  isOnce: boolean
) {
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      // 排除文本节点
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], `${key}_${i}`, isOnce)
      }
    }
  } else {
    markStaticNode(tree, key, isOnce)
  }
}
/**
 * 标记静态节点
 * @param node 虚拟节点
 * @param key 节点的 key
 * @param isOnce 是否只渲染一次
 */
function markStaticNode (node, key, isOnce) {
  // 将该节点标记为静态的
  node.isStatic = true
  // 设置虚拟节点的 key
  node.key = key
  // 标记该节点只进行一次数据绑定
  node.isOnce = isOnce
}
