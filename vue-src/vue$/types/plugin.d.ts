import { Vue as _Vue } from "./vue";

/** 插件安装函数 */
export type PluginFunction<T> = (Vue: typeof _Vue, options?: T) => void;

/** 插件对象 */
export interface PluginObject<T> {
  /** 安装函数 */
  install: PluginFunction<T>;
  /** 其他键值对 */
  [key: string]: any;
}
