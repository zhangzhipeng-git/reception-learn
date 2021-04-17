import { Component, ComponentOptions } from "../../types/options";
import { VNodeComponentOptions, VNodeData } from "../../types/vnode";
/**
 * 虚拟节点
 */
export default class VNode {
  /** 虚拟节点标签 */
  tag: string | void;
  /** 虚拟节点数据 */
  data: VNodeData | void;
  /** 虚拟节点孩子节点集合 */
  children: Array<VNode>;
  /** 虚拟节点文本 */
  text: string | void;
  /** 虚拟节点对应的真实 dom ，用于插入父节点和 patch 更新 */
  elm: Node | void;
  /** 虚拟节点命名空间，如 svg:xx 的 svg、 math:xx 的 math*/
  ns: string | void;
  /** 虚拟节点上下文，组件实例 */
  context: Component | void; // rendered in this component's scope
  /** 虚拟节点的 key，如果 key 一致（标签和选择器相同时），则认为节点相同，会执行 patchVnode */
  key: string | number | void;
  /** 组件选项 */
  componentOptions: VNodeComponentOptions | void;
  /** 组件实例 */
  componentInstance: Component | void; // component instance
  /** 父虚拟节点 */
  parent: VNode | void; // component placeholder node

  // strictly internal
  /** 未加工的 html ，只用于服务端 */
  raw: boolean; // contains raw HTML? (server only)
  /** 是否时静态的节点，没有绑定数据 */
  isStatic: boolean; // hoisted static node
  /** 是否根节点插入，进入渐变检查会用到 */
  isRootInsert: boolean; // necessary for enter transition check
  /** 是否是注释 */
  isComment: boolean; // empty comment placeholder?
  /** 是否是克隆出来的 */
  isCloned: boolean; // is a cloned node?
  /** 是否被绑定了 v-once，初始化后便不再更新 */
  isOnce: boolean; // is a v-once node?
  /** 异步工厂函数，路由懒加载 */
  asyncFactory: Function | void; // async component factory function
  /** 异步相关元数据 */
  asyncMeta: Object | void;
  /** 是否异步组件占位符，标识该虚拟节点是一个注释节点，异步请求 js 并执行完后，告诉异步的组件要插入到哪里 */
  isAsyncPlaceholder: boolean;
  /** 服务端渲染的上下文 */
  ssrContext: Object | void;
  /** 功能节点的真实上下文vm ？ */
  fnContext: Component | void; // real context vm for functional nodes
  /** 用于服务端渲染的缓存 */
  fnOptions: ComponentOptions<any>; // for SSR caching
  /** 用于为devtools存储功能性渲染上下文，用于 devtools 渲染的上下文 */
  devtoolsMeta: Object; // used to store functional render context for devtools
  /** 范围id，用于范围 css ？ */
  fnScopeId: string; // functional scope id support
  /**
   * 
   * @param tag 标签名
   * @param data 虚拟节点数据
   * @param children 子节点
   * @param text 文本
   * @param elm 真实dom
   * @param context 上下文
   * @param componentOptions 组件选项
   * @param asyncFactory 异步工厂
   */
  constructor (
    tag?: string | void,
    data?: VNodeData | void,
    children?: Array<VNode>,
    text?: string | void,
    elm?: Node | void,
    context?: Component | void,
    componentOptions?: VNodeComponentOptions | void,
    asyncFactory?: Function | void
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }
  // 被弃用，被用于向后兼容，获取它的组件实例
  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}
/**
 * 创建空的虚拟节点，并标记为注释节点
 * @param text 文本
 */
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}
/**
 * 创建空的文本节点
 * @param val 会变成文本，String(val)
 */
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
/**
 * 优化浅克隆
 * 用于静态节点和插槽节点，因为它们可以被重用，
 * 多重渲染，通过克隆来避免在操作 dom 的时产生的 dom 引用错误
 * @param vnode 被克隆的虚拟节点
 */
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    // 浅克隆子节点数组
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
