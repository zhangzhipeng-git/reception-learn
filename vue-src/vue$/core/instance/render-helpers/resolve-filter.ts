import { identity, resolveAsset } from '../../util/index'

/**
 * Runtime helper for resolving filters
 */
/**
 * 在组件实例合并后选项中解析出 key 对应的过滤器（一个函数）
 * @param id 过滤器 id （管道 id）
 */
export function resolveFilter (id: string): Function {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}
