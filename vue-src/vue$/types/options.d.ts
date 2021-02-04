import { Vue, CreateElement, CombinedVueInstance } from "./vue";
import { VNode, VNodeData, VNodeDirective, NormalizedScopedSlot } from "./vnode";

/** 构造器 */
type Constructor = {
  new (...args: any[]): any;
}

/**
 * 无法推断异步组件的 prop 属性
 * 
 * 注意：ComponentOptions<V> 的泛型 V 是确定不变的，但是 V 中data，methods等的是确定的，而其他的可以使用最底层的类型 never 来收敛
 */
// we don't support infer props in async component
// N.B. ComponentOptions<V> is contravariant, the default generic should be bottom type
export type Component<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps> =
  | typeof Vue
  | FunctionalComponentOptions<Props>
  | ComponentOptions<never, Data, Methods, Computed, Props>

/** es6+ module 模块化组件，可以使用 require('module')['default'] 取得组件  */
interface EsModuleComponent {
  default: Component
}

/** 异步组件 */
export type AsyncComponent<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps>
  = AsyncComponentPromise<Data, Methods, Computed, Props>
  | AsyncComponentFactory<Data, Methods, Computed, Props>

/** 异步组件 Promise */
export type AsyncComponentPromise<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps> = (
  resolve: (component: Component<Data, Methods, Computed, Props>) => void,
  reject: (reason?: any) => void
) => Promise<Component | EsModuleComponent> | void;

/** 异步组件工厂 */
export type AsyncComponentFactory<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps> = () => {
  component: AsyncComponentPromise<Data, Methods, Computed, Props>;
  loading?: Component | EsModuleComponent;
  error?: Component | EsModuleComponent;
  delay?: number;
  timeout?: number;
}

/**
 * 访问某个对象的属性
 * When the `Computed` type parameter on `ComponentOptions` is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of `Accessors<Computed>` and work backwards.
 */
export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
}

type DataDef<Data, Props, V> = Data | ((this: Readonly<Props> & V) => Data)
/**
 * This type should be used when an array of strings is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithArrayProps<V extends Vue, Data, Methods, Computed, PropNames extends string> =
  object &
  ComponentOptions<V, DataDef<Data, Record<PropNames, any>, V>, Methods, Computed, PropNames[], Record<PropNames, any>> &
  ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Record<PropNames, any>>>>;

/**
 * This type should be used when an object mapped to `PropOptions` is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithRecordProps<V extends Vue, Data, Methods, Computed, Props> =
  object &
  ComponentOptions<V, DataDef<Data, Props, V>, Methods, Computed, RecordPropsDefinition<Props>, Props> &
  ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Props>>>;

type DefaultData<V> =  object | ((this: V) => object);
type DefaultProps = Record<string, any>;
type DefaultMethods<V> =  { [key: string]: (this: V, ...args: any[]) => any };
type DefaultComputed = { [key: string]: any };
/** 组件选项 */
export interface ComponentOptions<
  V extends Vue,
  Data=DefaultData<V>,
  Methods=DefaultMethods<V>,
  Computed=DefaultComputed,
  PropsDef=PropsDefinition<DefaultProps>,
  Props=DefaultProps> {
  data?: Data;
  props?: PropsDef;
  propsData?: object;
  computed?: Accessors<Computed>;
  methods?: Methods;
  /** 观察属性 */
  watch?: Record<string, WatchOptionsWithHandler<any> | WatchHandler<any> | string>;

  el?: Element | string;
  template?: string;
  // hack is for functional component type inference, should not be used in user code
  render?(createElement: CreateElement, hack: RenderContext<Props>): VNode;
  renderError?(createElement: CreateElement, err: Error): VNode;
  staticRenderFns?: ((createElement: CreateElement) => VNode)[];

  beforeCreate?(this: V): void;
  created?(): void;
  beforeDestroy?(): void;
  destroyed?(): void;
  beforeMount?(): void;
  mounted?(): void;
  beforeUpdate?(): void;
  updated?(): void;
  activated?(): void;
  deactivated?(): void;
  errorCaptured?(err: Error, vm: Vue, info: string): boolean | void;
  serverPrefetch?(this: V): Promise<void>;

  directives?: { [key: string]: DirectiveFunction | DirectiveOptions };
  components?: { [key: string]: Component<any, any, any, any> | AsyncComponent<any, any, any, any> };
  transitions?: { [key: string]: object };
  filters?: { [key: string]: Function };

  provide?: object | (() => object);
  inject?: InjectOptions;
  /** 双向绑定 */
  model?: {
    prop?: string;
    event?: string;
  };

  parent?: Vue;
  mixins?: (ComponentOptions<Vue> | typeof Vue)[];
  /** 组件名称 */
  name?: string;
  /** 继承 */
  // TODO: support properly inferred 'extends'
  extends?: ComponentOptions<Vue> | typeof Vue;
  /** 分隔符 */
  delimiters?: [string, string];
  /** 注释（待定） */
  comments?: boolean;
  /** 是否继承属性 */
  inheritAttrs?: boolean;
}
/** 函数式组件（无需实例化，没有状态） */
export interface FunctionalComponentOptions<Props = DefaultProps, PropDefs = PropsDefinition<Props>> {
  /** 组件名称 */
  name?: string;
  /** 输入属性集合 */
  props?: PropDefs;
  /** 双向绑定 */
  model?: {
    prop?: string;
    event?: string;
  };
  /** 注入 */
  inject?: InjectOptions;
  /** 是否函数式 */
  functional: boolean;
  render?(this: undefined, createElement: CreateElement, context: RenderContext<Props>): VNode | VNode[];
}
/** 渲染上下文 */
export interface RenderContext<Props=DefaultProps> {
  /** 输入属性 */
  props: Props;
  /** 子节点集合（虚拟节点） */
  children: VNode[];
  /** 插槽函数 */
  slots(): any;
  /** 虚拟数据data */
  data: VNodeData;
  /** 父组件实例 */
  parent: Vue;
  /** 事件监听集合 */
  listeners: { [key: string]: Function | Function[] };
  /** 范围插槽 */
  scopedSlots: { [key: string]: NormalizedScopedSlot };
  /** 注入集合 */
  injections: any
}
/** 某个输入属性 */
export type Prop<T> = { (): T } | { new(...args: never[]): T & object } | { new(...args: string[]): Function }
/** 输入属性类型 */
export type PropType<T> = Prop<T> | Prop<T>[];
/** 输入类型校验 */
export type PropValidator<T> = PropOptions<T> | PropType<T>;
/** 输入属性选项 */
export interface PropOptions<T=any> {
  /** 类型 */
  type?: PropType<T>;
  /** 是否必须 */
  required?: boolean;
  /** 默认值 */
  default?: T | null | undefined | (() => T | null | undefined);
  /** 校验器，函数，返回布尔类型 */
  validator?(value: T): boolean;
}
/** 属性校验器键对应的校验器 */
export type RecordPropsDefinition<T> = {
  [K in keyof T]: PropValidator<T[K]>
}
/** 属性键集合 */
export type ArrayPropsDefinition<T> = (keyof T)[];
export type PropsDefinition<T> = ArrayPropsDefinition<T> | RecordPropsDefinition<T>;
/** 计算属性 */
export interface ComputedOptions<T> {
  /** getter */
  get?(): T;
  /** setter */
  set?(value: T): void;
  /** 是否缓存 */
  cache?: boolean;
}
/** 观察属性钩子 */
export type WatchHandler<T> = (val: T, oldVal: T) => void;
/** 观察选项 */
export interface WatchOptions {
  /** 深度观察 */
  deep?: boolean;
  /** 是否立即观察，第一次赋值就执行观察属性钩子 */
  immediate?: boolean;
}
/** 观察属性钩子对象（观察属性选项+观察属性钩子） */
export interface WatchOptionsWithHandler<T> extends WatchOptions {
  /** 观察属性钩子 */
  handler: WatchHandler<T>;
}
/** 指令绑定对象继承于虚拟节点指令 */
export interface DirectiveBinding extends Readonly<VNodeDirective> {
  readonly modifiers: { [key: string]: boolean };
}
/** 指令函数 */
export type DirectiveFunction = (
  el: HTMLElement,
  binding: DirectiveBinding,
  vnode: VNode,
  oldVnode: VNode
) => void;
/** 指令选项 */
export interface DirectiveOptions {
  /** 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。 */
  bind?: DirectiveFunction;
  /** 被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中 */
  inserted?: DirectiveFunction;
  /** 所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新 */
  update?: DirectiveFunction;
  /** 指令所在组件的 VNode 及其子 VNode 全部更新后调用。 */
  componentUpdated?: DirectiveFunction;
  /** 只调用一次，指令与元素解绑时调用 */
  unbind?: DirectiveFunction;
}
/** 注入键 */
export type InjectKey = string | symbol;
/** 注入选项 */
export type InjectOptions = {
  [key: string]: InjectKey | { from?: InjectKey, default?: any }
} | string[];
