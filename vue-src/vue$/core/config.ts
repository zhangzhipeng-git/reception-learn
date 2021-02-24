import {
    no,
    noop,
    identity
} from '../shared/util';

import { LIFECYCLE_HOOKS } from '../shared/constants';
import { Component } from '../types/options';

export type Config = {
    /** 选项合并策略 */
    optionMergeStrategies: {[key: string]: (...args) => any};
    /** 是否不提示 */
    silent: boolean;
    /** 生产提示 */
    productionTip: boolean;
    /** 性能 */
    performance: boolean;
    /** 开发调试工具 */
    devtools: boolean;
    /**
     * 错误处理器
     * @param  {Error} err Error
     * @param  {Component} vm vue实例
     * @param  {string} info 信息
     */
    errorHandler?: (err: Error, vm: Component, info: string) => void;
    /**
     * 警告处理器
     * @param  {string} msg 消息
     * @param  {Component} vm vue实例
     * @param  {string} trace 轨迹
     */
    warnHandler?: (msg: string, vm: Component, trace: string) => void;
    /** 忽略的元素集合或正则集合 */
    ignoredElements: Array<string | RegExp>
    /** 按键码值 */
    keyCodes: {[key: string]: number | Array<number>}

    /** 是否保留标签 */
    isReservedTag: (x?: string) => boolean;
    /** 是否保留属性 */
    isReservedAttr: (x?: string) => boolean;
    /** 转为平台相关标签名 */
    parsePlatformTagName: (x: string) => string;
    /** 是否未知元素 */
    isUnknownElement: (x?: string) => boolean;
    /** 获取标签命名空间 */
    getTagNamespace: (x?: string) => string | void;
    /** 必须使用prop */
    mustUseProp: (tag: string, type?: string, name?: string) => boolean;

    // private
    async: boolean;

    // legacy 遗留的
    _lifecycleHooks: Array<string>;

}

export default (<Config>{
    /** 合并策略 （在core/util/options下会用到） */
    optionMergeStrategies: Object.create(null),
    /** false时会打印警告 */
    silent: false,
    /** 启动时显示生产模式提示消息, 默认不显示 */
    productionTip: process.env.NODE_ENV !== 'production',
    /** 是否使用vue开发工具 */
    devtools: process.env.NODE_ENV !== 'production',
    /** 是否记录性能 */
    performance: false,
    /** 错误处理器观察错误 */
    errorHandler: null,
    /** 警告处理器观察警告 */
    warnHandler: null,
    /** 要忽略的自定义元素 */
    ignoredElements: [],
    /** 用户自定义的按键码 */
    keyCodes: Object.create(null),
    /** 默认不检查保留的标签 */
    isReservedTag: no,
    /** 默认不判断是否未知元素 */
    isUnknownElement: no,
    /** 获取标签命名空间，默认是个空函数 */
    getTagNamespace: noop,
    /** 解析特定平台的实际标记名，默认输入什么就输出什么 */
    parsePlatformTagName: identity,
    /** 默认不需要检查是否必须使用prop */
    mustUseProp: no,
    /**
     * 异步执行更新。拟由Vue Test Utils使用
     * 如果设置为false，这将显著降低性能。
     */
    async: true,
    /** 这个属性因为遗留原因暴露，生命周期钩子函数 */
    _lifecycleHooks: LIFECYCLE_HOOKS
});

