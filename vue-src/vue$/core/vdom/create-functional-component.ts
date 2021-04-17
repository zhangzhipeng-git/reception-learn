/* @flow */

import VNode, { cloneVNode } from './vnode'
import { createElement } from './create-element'
import { resolveInject } from '../instance/inject'
import { normalizeChildren } from './helpers/normalize-children'
import { resolveSlots } from '../instance/render-helpers/resolve-slots'
import { normalizeScopedSlots } from './helpers/normalize-scoped-slots'
import { installRenderHelpers } from '../instance/render-helpers/index'

import {
  isDef,
  isTrue,
  hasOwn,
  camelize,
  emptyObject,
  validateProp
} from '../util/index'
import { Component, VNodeData } from '../../types'
/**
 * 
 * @param data 虚拟节点 data
 * @param props props
 * @param children 虚拟子节点集合
 * @param parent 父组件
 * @param Ctor 组件构造器
 */
export function FunctionalRenderContext (
  data: VNodeData,
  props: Object,
  children: Array<VNode>,
  parent: Component | any,
  Ctor: FunctionConstructor | any 
) {
  // 组件构造器选项
  const options = Ctor.options
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  let contextVm
  // 父组件有唯一 id，经过了 _init 函数
  if (hasOwn(parent, '_uid')) {
    // 以父组件为原型创建一个实例
    contextVm = Object.create(parent)
    // $flow-disable-line
    // 该实例的源为父组件
    contextVm._original = parent
  } else {
    // 父组件也是一个函数式组件，将有 _uid （即经过了 _init 函数）
    // 的组件实例作为真正的上下文组件实例
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent
    // $flow-disable-line
    parent = parent._original
  }
  // 是否编译过
  const isCompiled = isTrue(options._compiled)
  // 如果没有编译，则需要规范化
  const needNormalization = !isCompiled
  // 虚拟节点 data
  this.data = data
  // props
  this.props = props
  // 虚拟子节点集合
  this.children = children
  // 父组件
  this.parent = parent
  // 监听器
  this.listeners = data.on || emptyObject
  // inject-provide
  this.injections = resolveInject(options.inject, parent)
  // slots 函数
  this.slots = () => {
    if (!this.$slots) { // 如果还没有 $slots ，则
      normalizeScopedSlots(
        data.scopedSlots,
        this.$slots = resolveSlots(children, parent)
      )
    }
    return this.$slots
  }

  Object.defineProperty(this, 'scopedSlots', ({
    enumerable: true,
    get () {
      return normalizeScopedSlots(data.scopedSlots, this.slots())
    }
  } as any))

  // support for compiled functional template
  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options
    // pre-resolve slots for renderSlot()
    this.$slots = this.slots()
    this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots)
  }

  if (options._scopeId) {
    this._c = (a, b, c, d) => {
      const vnode = createElement(contextVm, a, b, c, d, needNormalization)
      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId
        vnode.fnContext = parent
      }
      return vnode
    }
  } else {
    this._c = (a, b, c, d) => createElement(contextVm, a, b, c, d, needNormalization)
  }
}

installRenderHelpers(FunctionalRenderContext.prototype)

export function createFunctionalComponent (
  Ctor: Class<Component>,
  propsData: ?Object,
  data: VNodeData,
  contextVm: Component,
  children: ?Array<VNode>
): VNode | Array<VNode> | void {
  const options = Ctor.options
  const props = {}
  const propOptions = options.props
  if (isDef(propOptions)) {
    for (const key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject)
    }
  } else {
    if (isDef(data.attrs)) mergeProps(props, data.attrs)
    if (isDef(data.props)) mergeProps(props, data.props)
  }

  const renderContext = new FunctionalRenderContext(
    data,
    props,
    children,
    contextVm,
    Ctor
  )

  const vnode = options.render.call(null, renderContext._c, renderContext)

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
  } else if (Array.isArray(vnode)) {
    const vnodes = normalizeChildren(vnode) || []
    const res = new Array(vnodes.length)
    for (let i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext)
    }
    return res
  }
}

function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  const clone = cloneVNode(vnode)
  clone.fnContext = contextVm
  clone.fnOptions = options
  if (process.env.NODE_ENV !== 'production') {
    (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext
  }
  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot
  }
  return clone
}

function mergeProps (to, from) {
  for (const key in from) {
    to[camelize(key)] = from[key]
  }
}
