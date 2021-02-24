import { Vue } from "./vue";

export type ScopedSlot = (props: any) => ScopedSlotReturnValue;
type ScopedSlotReturnValue = VNode | string | boolean | null | undefined | ScopedSlotReturnArray;
interface ScopedSlotReturnArray extends Array<ScopedSlotReturnValue> {}

// Scoped slots are guaranteed to return Array of VNodes starting in 2.6
export type NormalizedScopedSlot = (props: any) => ScopedSlotChildren;
export type ScopedSlotChildren = VNode[] | undefined;

// Relaxed type compatible with $createElement
/** 虚拟子节点，可以是范围插槽，string ，null，undefined */
export type VNodeChildren = VNodeChildrenArrayContents | [ScopedSlot] | string | boolean | null | undefined;
export interface VNodeChildrenArrayContents extends Array<VNodeChildren | VNode> {}

/** 虚拟节点 */
export interface VNode {
  /** 标签名 */
  tag?: string;
  /** 虚拟节点数据 */
  data?: VNodeData;
  /** 子节点集合 */
  children?: VNode[];
  /** 文本 */
  text?: string;
  /** 对应的真实dom */
  elm?: Node;
  /** 命名空间 */
  ns?: string;
  /** 上下文 */
  context?: Vue;
  /** v-for 的 key，节点的唯一 key */
  key?: string | number;
  /** 组件选项 */
  componentOptions?: VNodeComponentOptions;
  /** 组件实例 */
  componentInstance?: Vue;
  /** 父节点 */
  parent?: VNode;
  /** 是否未经处理的 */
  raw?: boolean;
  /** 是否静态的 */
  isStatic?: boolean;
  /** 是否根节点插入 */
  isRootInsert: boolean;
  /** 是否注释节点 */
  isComment: boolean;
}
/** 虚拟节点组件选项 */
export interface VNodeComponentOptions {
  /** 构造器 */
  Ctor: typeof Vue;
  /** 输入属性 object */
  propsData?: object;
  /** 事件集合 object */
  listeners?: object;
  /** 子节点集合 */
  children?: VNode[];
  /** 标签 */
  tag?: string;
}
/** 虚拟节点数据 */
export interface VNodeData {
  /** v-for 的 key，节点的唯一 key */
  key?: string | number;
  /** slot 名称 */
  slot?: string;
  /** 范围插槽 */
  scopedSlots?: { [key: string]: ScopedSlot | undefined };
  /** 虚拟节点引用 */
  ref?: string;
  /** 是否在 v-for 里有节点引用 ref */
  refInFor?: boolean;
  /** 节点标签名 */
  tag?: string;
  /** 静态类名 css class */
  staticClass?: string;
  /** 输入 css class */
  class?: any;
  /** 静态样式 css style */
  staticStyle?: { [key: string]: any };
  /** 输入 css style */
  style?: string | object[] | object;
  /** 输入属性集合 */
  props?: { [key: string]: any };
  /** 属性集合 */
  attrs?: { [key: string]: any };
  /** dom 节点的属性集合 */
  domProps?: { [key: string]: any };
  /** 节点的钩子 */
  hook?: { [key: string]: Function };
  /** 事件监听集合 */
  on?: { [key: string]: Function | Function[] };
  /** 是否本节点监听，true 或 false 如：@click.native 时为true*/
  nativeOn?: { [key: string]: Function | Function[] };
  /** 渐变动画对象 */
  transition?: object;
  /** 是否隐藏 */
  show?: boolean;
  /** 行内模板，是编译后的 render 函数 或者 静态 render 函数（只创建一次，状态在创建之后就不改变， 如使用了 v-once 的节点） */
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Function[];
  };
  /** 指令集合 */
  directives?: VNodeDirective[];
  /** 是否路由复用 */
  keepAlive?: boolean;
}

/** 虚拟节点的指令 */
export interface VNodeDirective {
  /** 指令名称 */
  name: string;
  /** 指令传入的 value */
  value?: any;
  /** 之前的 value */
  oldValue?: any;
  /** 绑定的表达式 */
  expression?: any;
  /** 传给指令的参数。例如 v-my-directive:foo， arg 的值是 “foo”。  */
  arg?: string;
  /** 之前传给指令的参数 */
  oldArg?: string;
  /** 例如： v-my-directive.foo.bar, 修饰符对象 modifiers 的值是 { foo: true, bar: true }。*/
  modifiers?: { [key: string]: boolean };
}
