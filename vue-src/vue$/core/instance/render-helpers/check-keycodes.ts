import config from '../../../core/config'
import { hyphenate } from '../../../shared/util'

/**
 * 检测实际值是否包含于期望值，返回 true 或 false
 * @param expect 期望值
 * @param actual 实际值
 */
function isKeyNotMatch<T> (expect: T | Array<T>, actual: T): boolean {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
/**
 * 检查键码（keyCode 被弃用，而 code 有些浏览器不支持）。 
 * @param eventKeyCode 事件键码
 * @param key 事件键，如：esc，f1...
 * @param builtInKeyCode 内置键码，如：f1 对应的是 112
 * @param eventKeyName 事件键名称
 * @param builtInKeyName 内置键名称
 */
export function checkKeyCodes (
  eventKeyCode: number,
  key: string,
  builtInKeyCode?: number | Array<number>,
  eventKeyName?: string,
  builtInKeyName?: string | Array<string>
): boolean {
  // 得到映射后的键码
  const mappedKeyCode = config.keyCodes[key] || builtInKeyCode
  // 如果传入了内置键名称和事件键名称，并且全局配置中找不到 key 对应的键码
  // 则判断事件键名称是否是内置的键名
  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName)
  } else if (mappedKeyCode) {
    // 如果找到了键码，则判断传入的事件键码是否和映射后的键码匹配
    return isKeyNotMatch(mappedKeyCode, eventKeyCode)
  } else if (eventKeyName) {
    // 如果没有找到键码，则判断连字符的事件键名是否和传入的 key 相等
    return hyphenate(eventKeyName) !== key
  }
}
