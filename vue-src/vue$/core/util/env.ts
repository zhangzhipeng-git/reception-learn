
/** 判断是否支持__proto__, '__proto__ in {}' */
export const hasProto = '__proto__' in {}
declare const WXEnvironment;
/** 判断是否在浏览器中 */
export const inBrowser = typeof window !== 'undefined'
/** 判断是否在 Weex 环境 */
export const inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform
/** Weex 平台名称小写 */
export const weexPlatform = inWeex && WXEnvironment.platform.toLowerCase()
/** 浏览器的用户代理 */
export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
/** 是否IE浏览器 */
export const isIE = UA && /msie|trident/.test(UA)
/** 是否IE9浏览器 */
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
/** 是否IE升级版edge浏览器 */
export const isEdge = UA && UA.indexOf('edge/') > 0
/** 是否安卓环境 */
export const isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android')
/** 是否IOS环境 */
export const isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios')
/** 是否谷歌浏览器 */
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge
/** 是否服务端 phantomjs(常用于爬虫) 环境  */
export const isPhantomJS = UA && /phantomjs/.test(UA)
/** 是否火狐浏览器 */
export const isFF = UA && UA.match(/firefox\/(\d+)/)

// Firefox has a "watch" function on Object.prototype...
/** 火狐浏览器自带watch */
export const nativeWatch = (<any>{}).watch;
/** 是否支持时间的消极行为(这里的判断很巧妙)，即不阻止默认事件，提高性能 */
export let supportsPassive = false
if (inBrowser) {
  try {
    const opts = {};
    Object.defineProperty(opts, 'passive', {
      get () {
        /* istanbul ignore next */
        supportsPassive = true
      }
    }); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts)
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
let _isServer
/** 判断是否服务端 */
export const isServerRendering = () => {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && !inWeex && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'] && global['process'].env.VUE_ENV === 'server'
    } else {
      _isServer = false
    }
  }
  return _isServer
}

// detect devtools
/** Vue 开发工具 */
export const devtools = inBrowser && (<any>window).__VUE_DEVTOOLS_GLOBAL_HOOK__

/* istanbul ignore next */
/**
 * 判断某个函数是否原生函数
 * @param Ctor 某个构造函数
 */
export function isNative (Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

/** 判断是否支持 Symbol 类型，必须同时支持 Symbol 和 Reflect */
export const hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys)

/** Set */
let _Set;
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = class Set implements SimpleSet {
    set: Object;
    constructor () {
      this.set = Object.create(null)
    }
    has (key: string | number) {
      return this.set[key] === true
    }
    add (key: string | number) {
      this.set[key] = true
    }
    clear () {
      this.set = Object.create(null)
    }
  }
}
/**
 * Set 数据结构
 */
export interface SimpleSet {
  has(key: string | number): boolean;
  add(key: string | number): void;
  clear(): void;
}

export { _Set }
