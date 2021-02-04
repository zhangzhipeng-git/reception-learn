import config from '../config'
import { warn } from './debug'
import { inBrowser, inWeex } from './env'
import { isPromise } from '../../shared/util';
import { pushTarget, popTarget } from '../observer/dep'
/**
 * 内置错误处理函数
 * @param err 错误对象
 * @param vm Vue 实例
 * @param info 信息（字符串）
 */
export function handleError (err: Error, vm: any, info: string) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  // 设置全局的观察者 watcher 为空，在处理错误处理程序时停用deps跟踪，以避免可能的无限渲染
  pushTarget()
  try {
    if (vm) {
      let cur = vm
      while ((cur = cur.$parent)) { // 如果 vm 有父级
        const hooks = cur.$options.errorCaptured // 取父级的错误捕获钩子
        if (hooks) {
          for (let i = 0; i < hooks.length; i++) {
            try {
                // 调用错误捕获钩子
              const capture = hooks[i].call(cur, err, vm, info) === false
              // 直到错误捕获钩子返回false，即不报错时退出
              if (capture) return
            } catch (e) { // 如果该过程有异常，则调用全局的错误处理器
              globalHandleError(e, cur, 'errorCaptured hook')
            }
          }
        }
      }
    }
    // 没有 vm 实例直接调用全局的钩子
    globalHandleError(err, vm, info)
  } finally { 
      // 恢复上一个全局观察者 watcher
    popTarget()
  }
}
/**
 * 调用传入的函数，如果有返回并且是异步的，则处理异步的错误
 * @param handler 函数
 * @param context 上下文
 * @param args 参数
 * @param vm Vue 实例或其他
 * @param info 信息
 */
export function invokeWithErrorHandling (
  handler: Function,
  context: any,
  args: null | any[],
  vm: any,
  info: string
) {
  let res
  try {
    res = args ? handler.apply(context, args) : handler.call(context)
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true
    }
  } catch (e) {
    handleError(e, vm, info)
  }
  return res
}
/**
 * 全局错误处理器
 * @param err 错误对象
 * @param vm Vue 实例
 * @param info 信息
 */
function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
          // 打印错误信息或抛出错误
        logError(e, null, 'config.errorHandler')
      }
    }
  }
  // 打印错误信息或抛出错误
  logError(err, vm, info)
}
/**
 * 打印错误信息或抛出错误
 * @param err 错误对象
 * @param vm Vue 实例
 * @param info 信息 
 */
function logError (err, vm, info) {
  if (process.env.NODE_ENV !== 'production') {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}
