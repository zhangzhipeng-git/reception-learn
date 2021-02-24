import { Vue } from "./vue";
import "./umd";
import { Component } from "./options";
import { VNode } from "./vnode";

export default Vue;

export {
  CreateElement,
  VueConstructor
} from "./vue";

export {
  Component,
  AsyncComponent,
  ComponentOptions,
  FunctionalComponentOptions,
  RenderContext,
  PropType,
  PropOptions,
  ComputedOptions,
  WatchHandler,
  WatchOptions,
  WatchOptionsWithHandler,
  DirectiveFunction,
  DirectiveOptions
} from "./options";

export {
  PluginFunction,
  PluginObject
} from "./plugin";

export {
  VNodeChildren,
  VNodeChildrenArrayContents,
  VNode,
  VNodeComponentOptions,
  VNodeData,
  VNodeDirective
} from "./vnode";

/** 作用域插槽数据（可能是组合模式） */
export type ScopedSlotsData = Array<{ key: string, fn: Function } | ScopedSlotsData>;
/** 内部组件选项 */
export type InternalComponentOptions = {
  /** 是组件 */
  _isComponent: true;
  /** 父组件 */
  parent: Component;
  /** 父组件虚拟节点 */
  _parentVnode: VNode;
  /** render 函数 */
  render?: Function;
  /** 静态 render 函数 */
  staticRenderFns?: Array<Function>
};
