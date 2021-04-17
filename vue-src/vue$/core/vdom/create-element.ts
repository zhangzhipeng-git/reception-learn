import config from '../config'
import VNode, { createEmptyVNode } from './vnode'
import { createComponent } from './create-component'
import { traverse } from '../observer/traverse'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isObject,
  isPrimitive,
  resolveAsset
} from '../util/index'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from './helpers/index'
import { Component } from '../../types'
import { VNodeData } from '../../types/umd'
/** 简单规范化 */
const SIMPLE_NORMALIZE = 1
/** 一直规范化 */
const ALWAYS_NORMALIZE = 2

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
/**
 * 一个包裹函数，实际上是调用 _createElement
 * @param context 上下文儿
 * @param tag 标签名
 * @param data 虚拟节点 data
 * @param children 子节点
 * @param normalizationType 规范化类型
 * @param alwaysNormalize 是否一直规范化
 */
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  // 没有传 data
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  // 如果是递归规范化
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
/**
 * 创建虚拟节点
 * @param context 上下文
 * @param tag 标签名
 * @param data 虚拟节点 data
 * @param children 子节点
 * @param normalizationType 规范化类型 
 */
export function _createElement (
  context: Component | any,
  tag?: string | Function | Object,
  data?: VNodeData | any,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  // 如果定义了虚拟节点 data 并且 data 是被观测的，
  // 则在开发模式下警告应该使用新的未被观测的 data ，
  // 返回空的虚拟虚拟节点。
  if (isDef(data) && isDef((data as any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  // <component :is="" />
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  // 不存在标签名，创建空的虚拟节点
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    // @ts-ignore
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  // 支持简单函数子节点作为默认作用域槽
  // 如果字节点是数组且第一个是函数
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    // 默认作用域插槽
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  // 摊平1层节点数组
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    // 合并连续的文本节点为一个节点
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  // tag 是字符串
  if (typeof tag === 'string') {
    // 构造器
    let Ctor
    // 命名空间
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // 是否保留的标签
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      // 保留的标签不支持 .native 修饰符
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      // 虚拟节点
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      // 根据组件构造器创建虚拟节点
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      // 未知节点或未列出命名空间的元素
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // tag 是组件选项或构造器
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  // 如果虚拟节点是数组，直接返回
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    // 有虚拟节点

    // 如果有命名空间
    if (isDef(ns)) applyNS(vnode, ns)
    // 有虚拟节点 data
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else { // 没有生成虚拟节点，创建一个空的虚拟节点
    return createEmptyVNode()
  }
}
/**
 * 应用命名空间
 * @param vnode 虚拟节点
 * @param ns 命名空间
 * @param force 强制添加 ns
 */
function applyNS (vnode, ns, force?) {
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined
    force = true
  }
  // 存在虚拟节点的子节点
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force)
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
/**
 * 深度绑定如 :style 和 :class 用于槽节点
 * @param data 虚拟节点 data
 */
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style)
  }
  if (isObject(data.class)) {
    traverse(data.class)
  }
}
