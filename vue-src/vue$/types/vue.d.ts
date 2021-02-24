import {
  Component,
  AsyncComponent,
  ComponentOptions,
  FunctionalComponentOptions,
  WatchOptionsWithHandler,
  WatchHandler,
  DirectiveOptions,
  DirectiveFunction,
  RecordPropsDefinition,
  ThisTypedComponentOptionsWithArrayProps,
  ThisTypedComponentOptionsWithRecordProps,
  WatchOptions,
} from "./options";
import { VNode, VNodeData, VNodeChildren, NormalizedScopedSlot } from "./vnode";
import { PluginFunction, PluginObject } from "./plugin";
/** 创建元素的函数，有2个重载，一个带data，一个不带data */
export interface CreateElement {
  /**
   * @param  tag? stirng ，Component，AsyncComponent
   * @param  {VNodeChildren} children? 子虚拟节点
   * @returns VNode 返回虚拟节点
   */
  (tag?: string | Component<any, any, any, any> | AsyncComponent<any, any, any, any> | (() => Component), children?: VNodeChildren): VNode;
  /**
   * @param  tag? stirng ，Component，AsyncComponent
   * @param data? 数据（待定）
   * @param  {VNodeChildren} children? 子虚拟节点
   * @returns VNode 返回虚拟节点
   */
  (tag?: string | Component<any, any, any, any> | AsyncComponent<any, any, any, any> | (() => Component), data?: VNodeData, children?: VNodeChildren): VNode;
}
/** Vue类 */
export interface Vue {
  /** 真实dom外壳 */
  readonly $el: Element;
  /** 组件选项 */
  readonly $options: ComponentOptions<Vue>;
  /** 父类实例 */
  readonly $parent: Vue;
  /** 根类实例 */
  readonly $root: Vue;
  /** 子实例集合 */
  readonly $children: Vue[];
  /** 真实节点引用集合 */
  readonly $refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  /** 插槽集合 */
  readonly $slots: { [key: string]: VNode[] | undefined };
  /** 范围插槽集合（子组件数据可以传入父组件） */
  readonly $scopedSlots: { [key: string]: NormalizedScopedSlot | undefined };
  /** 是否服务端 */
  readonly $isServer: boolean;
  /** 响应式data */
  readonly $data: Record<string, any>;
  /** 输入属性 */
  readonly $props: Record<string, any>;
  /** 服务端渲染上下文 */
  readonly $ssrContext: any;
  /** 实例对应的虚拟节点 */
  readonly $vnode: VNode;
  /** 节点传入的属性集合 */
  readonly $attrs: Record<string, string>;
  /** 节点绑定的事件集合 */
  readonly $listeners: Record<string, Function | Function[]>;
  /** 挂在 */
  $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
  /** 强制所有子 Vnode 和本 Vnode 更新*/
  $forceUpdate(): void;
  /** 销毁钩子 */
  $destroy(): void;
  /** 设置响应式数据 */
  $set: typeof Vue.set;
  /** 删除响应式数据 */
  $delete: typeof Vue.delete;
  /** vm.$watch 直接监听属性变化 */
  $watch(
    expOrFn: string,
    callback: (this: this, n: any, o: any) => void,
    options?: WatchOptions
  ): (() => void);
  /** vm.$watch 直接监听属性变化，'this.xx.yyy' */
  $watch<T>(
    expOrFn: (this: this) => T,
    callback: (this: this, n: T, o: T) => void,
    options?: WatchOptions
  ): (() => void);
  /** 绑定事件 */
  $on(event: string | string[], callback: Function): this;
  /** 绑定事件只执行一次 */
  $once(event: string | string[], callback: Function): this;
  /** 解绑事件 */
  $off(event?: string | string[], callback?: Function): this;
  /** 发射事件 */
  $emit(event: string, ...args: any[]): this;
  /** 注册函数，在上一轮更新视图完成后执行 */
  $nextTick(callback: (this: this) => void): void;
  /** 在上一轮更新视图完成后执行，返回 Promise */
  $nextTick(): Promise<void>;
  /** 创建元素 */
  $createElement: CreateElement;
}

export type CombinedVueInstance<Instance extends Vue, Data, Methods, Computed, Props> =  Data & Methods & Computed & Props & Instance;
export type ExtendedVue<Instance extends Vue, Data, Methods, Computed, Props> = VueConstructor<CombinedVueInstance<Instance, Data, Methods, Computed, Props> & Vue>;
/** vue 配置 */
export interface VueConfiguration {
  /** 是否“沉默”，不打印警告 */
  silent: boolean;
  /** 选项合并策略 */
  optionMergeStrategies: any;
  /** 开发工具 */
  devtools: boolean;
  /** 生产提示 */
  productionTip: boolean;
  /** 开启性能检测 */
  performance: boolean;
  /** 错误处理器 */
  errorHandler(err: Error, vm: Vue, info: string): void;
  /** 警告处理器 */
  warnHandler(msg: string, vm: Vue, trace: string): void;
  /** 忽略的元素集合（字符串或这正则表达式） */
  ignoredElements: (string | RegExp)[];
  /** 键值码 */
  keyCodes: { [key: string]: number | number[] };
  /** 是否异步（待定） */
  async: boolean;
}
/** Vue 构造器 */
export interface VueConstructor<V extends Vue = Vue> {
  new <Data = object, Methods = object, Computed = object, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): CombinedVueInstance<V, Data, Methods, Computed, Record<PropNames, any>>;
  // ideally, the return type should just contain Props, not Record<keyof Props, any>. But TS requires to have Base constructors with the same return type.
  new <Data = object, Methods = object, Computed = object, Props = object>(options?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>): CombinedVueInstance<V, Data, Methods, Computed, Record<keyof Props, any>>;
  new (options?: ComponentOptions<V>): CombinedVueInstance<V, object, object, object, Record<keyof object, any>>;
  extend<Data, Methods, Computed, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>;
  extend<Data, Methods, Computed, Props>(options?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props>;
  extend<PropNames extends string = never>(definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>>;
  extend<Props>(definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>): ExtendedVue<V, {}, {}, {}, Props>;
  extend(options?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}>;

  nextTick<T>(callback: (this: T) => void, context?: T): void;
  nextTick(): Promise<void>
  set<T>(object: object, key: string | number, value: T): T;
  set<T>(array: T[], key: number, value: T): T;
  delete(object: object, key: string | number): void;
  delete<T>(array: T[], key: number): void;

  directive(
    id: string,
    definition?: DirectiveOptions | DirectiveFunction
  ): DirectiveOptions;
  filter(id: string, definition?: Function): Function;

  component(id: string): VueConstructor;
  component<VC extends VueConstructor>(id: string, constructor: VC): VC;
  component<Data, Methods, Computed, Props>(id: string, definition: AsyncComponent<Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props>;
  component<Data, Methods, Computed, PropNames extends string = never>(id: string, definition?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>;
  component<Data, Methods, Computed, Props>(id: string, definition?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props>;
  component<PropNames extends string>(id: string, definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>>;
  component<Props>(id: string, definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>): ExtendedVue<V, {}, {}, {}, Props>;
  component(id: string, definition?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}>;

  use<T>(plugin: PluginObject<T> | PluginFunction<T>, options?: T): VueConstructor<V>;
  use(plugin: PluginObject<any> | PluginFunction<any>, ...options: any[]): VueConstructor<V>;
  mixin(mixin: VueConstructor | ComponentOptions<Vue>): VueConstructor<V>;
  compile(template: string): {
    render(createElement: typeof Vue.prototype.$createElement): VNode;
    staticRenderFns: (() => VNode)[];
  };

  observable<T>(obj: T): T;

  config: VueConfiguration;
  version: string;
}

export const Vue: VueConstructor;
