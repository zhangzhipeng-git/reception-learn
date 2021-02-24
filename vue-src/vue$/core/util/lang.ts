
/** 
 * 匹配某些unicode
 * 
 * 匹配26个大小写字母
 * 
 * 匹配“.”、拉丁字符À到Ö、拉丁字符Ø到ö、拉丁字符ø到ͽ等（后面不知道什么字符...）
 */
export const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/

/**
 * 检查是否以$或_开头的字符串
 * @param str 目标字符串
 */
export function isReserved(str: string): boolean {
    const c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F;
}

/**
 * 使用属性描述器定义对象属性
 * @param obj 目标对象
 * @param key 键
 * @param val 值
 * @param enumerable 是否可枚举
 */
export function def(obj: object, key: string, val: any, enumerable?: boolean) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable, // 可枚举
        writable: true, // 可写
        configurable: true // 可删除，可修改除 writable 外的属性
    });
}

/** * 匹配类如a.b.c的字符串 */
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)
/**
 * 解析路径，是不需要解析的路径则退出，
 * 如果是则返回一个函数
 * （传入对象，返回路径对象，如a.b.c.d.e.f中b.c.e.f为路径，返回最后一个对象f）
 * @param path 路径
 */
export function parsePath(path: string) {
    if (bailRE.test(path)) {
        return;
    }
    const segments = path.split('.');
    return function(obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return;
            obj = obj[segments[i]];
        }
        return obj;
    }
}