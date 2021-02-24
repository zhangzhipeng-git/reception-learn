import config from '../../core/config'
import { warn, makeMap, isNative } from '../util/index'

let initProxy
// 如果不是生产环境
if (process.env.NODE_ENV !== 'production') {
  // 定义全局可访问的全局函数或常量
  // 模板中允许出现的非vue实例定义的变量
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  )
  /**
   * 警告目标对象 target 的 key 不存在
   * @param target 目标对象
   * @param key 属性
   */
  const warnNonPresent = (target, key) => {
    warn(
      `Property or method "${key}" is not defined on the instance but ` +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    )
  }
  /**
   * 警告目标对象 target 的属性 key 是以 $ 或 _ 开头的
   * @param target 目标对象
   * @param key 属性
   */
  const warnReservedPrefix = (target, key) => {
    warn(
      `Property "${key}" must be accessed with "$data.${key}" because ` +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals. ' +
      'See: https://vuejs.org/v2/api/#data',
      target
    )
  }
  /** 判断是否支持 Proxy */
  const hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy)
  // 如果存在 Proxy
  if (hasProxy) {
    // 创建内置事件修饰符的 map
    const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact')
    config.keyCodes = new Proxy(config.keyCodes, {
      set (target, key, value) {
        // 不能修改内置的修饰符
        if (isBuiltInModifier(<any>key)) {
          warn(`Avoid overwriting built-in modifier in config.keyCodes: .${<any>key}`)
          return false
        } else {
          // 设置 config.keyCodes 的键对应的键码
          target[<any>key] = value
          return true
        }
      }
    })
  }
  const hasHandler = {
    /**
     * 判断对象 target 是否有 key
     * @param target 目标对象
     * @param key 属性
     */
    has (target, key) {
      // 是否 target 存在某个属性
      const has = key in target
      // 是否被允许的值，可全局访问的或者 （key是字符串并且是以_开头并且不在实例中的响应式数据中）
      const isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data))
       // 不存在 key 对应的属性并且是不被允许的属性
        if (!has && !isAllowed) {
        // 是 target 响应式数据中的 key，访问的时候要使用 $data[key]
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return has || !isAllowed
    }
  }

  const getHandler = {
    /**
     * 获取 target key 的值
     * @param target 
     * @param key 
     */
    get (target, key) {
      // 如果属性不是字符串并且不是 target 的属性
      if (typeof key === 'string' && !(key in target)) {
        // 但是在 target 的响应式数据中
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      // 返回 target 中 key 对应的值
      return target[key]
    }
  }
  /**
   * 为实例代理枚举和访问属性
   * hasHandler 的 has 返回 false 的属性不可访问
   */
  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      const options = vm.$options
      // 如果 render 函数存在并且 _withStripped 为 true 
      //（ _withStripped 属性只在测试代码中被设置为 true ）
      // 所以正常情况一般是走 hasHandler
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler
      vm._renderProxy = new Proxy(vm, handlers)
    } else {
      vm._renderProxy = vm
    }
  }
}

export { initProxy }
