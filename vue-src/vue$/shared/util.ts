/** 一个不含属性的对象（但是有__proto__属性），不可添加和修改属性 */
export const emptyObject = Object.freeze({});

/** 是否未定义（undefined或者null） */
export function isUndef(v: any): boolean {
    return v === undefined || v === null;
}

/** 是否定义了（不为undefined且不为null） */
export function isDef(v: any): boolean {
    return v !== undefined && v !== null;
}

export function isTrue(v: any): boolean {
    return v === true
}

export function isFalse(v: any): boolean {
    return v === false
}

/** 是否string或number或symbol或boolean类型 */
export function isPrimitive(v: any): boolean {
    return (
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'symbol' ||
        typeof v === 'boolean'
    );
}

/**
 * 判断是不是object且不是null（因为typeof null === 'object'）
 * @param obj 目标对象
 * 
 * 小记：typeof null === 'object' , typeof undefined === 'undefined
 */
export function isObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object';
}

const _toString = Object.prototype.toString;

/**
 * 原始类型 Array ， Date ，Object，String，Number，Boolean等
 * @param v 
 */
export function toRawType(v: any) {
        return _toString.call(v).slice(8, -1);
}

/**
 * 判断v是否是纯对象，
 * 是 new Object() 实例化的对象
 * 或非 Date，String等 new 出来的对象
 * 或字面量 {} 形式创建的对象
 * 调用该实例的 toString 方法得到的是 [object Object]
 * @param v 
 */
export function isPlainObject(v: any) {
    return _toString.call(v) === '[object Object]';
}
/**
 * 判断 v 是否正则表达式对象
 * @param v 对象
 */
export function isRegExp(v: any) {
    return _toString.call(v) === '[object RegExp]';
}

/**
 * 检查v是否是有效的的数组下标（0或正数且小于正无穷大）
 * @param v 数组下标
 * 备注：isFinite方法不能顾名思义，它在参数为非数字（可以是数字的字符串）或者是正、负无穷大的数时返回 false。
 */
export function isValidArrayIndex(v: any) {
    const n = parseFloat(String(v));
    return n >= 0 && Math.floor(n) === n && isFinite(v);
}

/**
 * 判断传入值是否为 Promise 实例
 * @param val 传入的值
 */
export function isPromise (val: any): boolean {
    return (
        isDef(val) &&
        typeof val.then === 'function' &&
        typeof val.catch === 'function'
    )
}

/**
 * 转换为字符串
 * 
 * 如果是null则变为''
 * 
 * 如果是数组或纯对象则变成json字符串
 * 
 * 如果v是其他的则变成String(v)
 * @param v 
 */
export function toString(v: any): string {
    return v == null ?
    '' : Array.isArray(v) || (isPlainObject(v) && v.toString === _toString)
    ? JSON.stringify(v, null, 2) : String(v);
}

/**
 * 将v变成数字
 * @param v 
 */
export function toNumber(v: any) {
    const n = parseFloat(v);
    return isNaN(v) ? v : n;
}

/**
 * 创建一个map，将字符串按','分割成数组，然后遍历作为map的key，并初始化为true，
 * 返回一个函数，该函数传入一个参数（map中的key）调用后返回true或者undefined
 * @param str 以','分割的词组字符串
 * @param expectsLowerCase 是否是小写
 */
export function makeMap(str: string, expectsLowerCase?: boolean): (v: string) => true | void {
    const map = Object.create(null); // 没有原型对象的对象
    const list = str.split(',');
    for (let i = 0, len = list.length; i < len; i++) {
        const e = list[i];
        map[e] = true;
    };
    return expectsLowerCase 
    ? v => map[v.toLowerCase()]
    : v => map[v];
}

/** 检查是否是内置的标签（slot，component） */
export const isBuiltInTag = makeMap('slot,component', true);

/** 检查是否保留的属性（key,ref,slot,slot-scope,is） */
export const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

/**
 * 将目标数组的某个元素提取出来（目标数组中没有这个元素了），返回一个只包含该元素的新数组
 * @param arr 目标数组
 * @param item 数组中某个元素
 */
export function remove(arr: Array<any>, item: any): Array<any> | void {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}

const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * 判断一个对象自身是否有属性key（不包含从基类继承过来的属性key）
 * @param obj 目标对象
 * @param key 属性键值
 */
export function hasOwn(obj: Object | Array<any>, key: string): boolean {
    return hasOwnProperty.call(obj, key);
}

/**
 * 返回一个带缓存的字符串处理功能函数（如果缓存中已经有处理结果，则直接返回，不用执行功能函数），
 * 这里每个功能函数都有一个对应的缓存
 * @param fn 对字符串做处理的功能函数，如转为驼峰式，首字母大写等
 */
export function cached<Function>(fn: (str: string) => any): (str: string) => any {
    const cache = Object.create(null);
    return (
        function cachedFn(str: string) {
            const hit = cache[str];
            return hit || (cache[str]=fn(str))
        }
    );
}

/** 匹配要转化为驼峰式的正则 */
const camelizeRE = /-(\w)/g;
/**
 * 返回一个函数，将包含'-'的变量转为驼峰命名，如将a-b-c转为aBC
 */
export const camelize: (str: string) => string = cached((str: string): string => {
    return str.replace(camelizeRE, (_, c: string) => c ? c.toUpperCase() : '');
});

/** 
 * 返回一个函数，字符串首字母大写
 */
export const capitalize = cached((str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
});

const hyphenateRE = /\B([A-Z])/g;
/** 
 * 返回一个函数，将驼峰式字符串转为以'-'连接的字符串
 */
export const hyphenate = cached((str: string) => {
    return str.replace(hyphenateRE, '-$1').toLowerCase();
});

/**
 * bind方法的腻子脚本（兼容bind方法），
 * 但和真正的bind方法还是有很大区别的，这里够用了
 * @param fn 目标函数
 * @param ctx 上下文
 */
function polyfillBind(fn: Function, ctx: object): (a: any) => any {
    function boundFn(a) {
        const l = arguments.length;
        return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx);
    }

    boundFn._length = fn.length;
    return boundFn;
}

/**
 * js原生bind
 * @param fn 目标函数
 * @param ctx 上下文
 */
function nativeBind(fn: () => void, ctx: object): () => void {
    return fn.bind(ctx);
}

/** 优先读取js原生bind */
export const bind = Function.prototype.bind ? nativeBind : polyfillBind;

/**
 * 将类似数组的对象转变为真正的对象
 * @param start 起始位置
 */
export function toArray(list: any, start?: number): Array<any> {
    start = start || 0
    let i = list.length - start;
    const ret: Array<any> = new Array(i);
    while(i--) {
        ret[i] = list[i + start];
    }
    return ret;
}

/**
 * 将源对象的属性混合到目标属性上
 * @param to 目标对象
 * @param _from 源对象
 */
export function extend(to: object, _from?: object): object {
    for(const key in _from) {
        to[key] = _from[key];
    }
    return to;
}

/**
 * 将对象数组转为一个简单的对象
 * @param arr 对象数组
 */
export function toObject(arr: Array<any>): object {
    const res = {};
    for (let i = 0, len = arr.length; i < len; i++) {
        const e = arr[i];
        if (e) {
            extend(res ,arr[i]);
        }
    }
    return res;
}

/** 空函数 */
export function noop(a?: any, b?: any, c?: any) {};

/** 返回false */
export const no = (a?: any, b?: any, c?: any) => false

/** 输入说明就输出什么，返回输入值 */
export const identity = (_: any) => _;

/**
 * 将要编译的模块集合的所有静态属性的键名用“,”连接起来
 * @param modules 编译模块集合
 */
export function genStaticKeys(modules: Array<any>): string {
    return modules.reduce((keys, m) => {
        return keys.concat(m.staticKeys||[])
    }, []).join(',');
}

/**
 * 比较a和b是不是长的一样
 * @param a 
 * @param b 
 */
export function looseEqual(a: any, b: any): boolean {
    if (a === b) return true;
    const isObjectA = isObject(a);
    const isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
        try {
            const isArrayA = Array.isArray(a);
            const isArrayB = Array.isArray(b);
            if (isArrayA && isArrayB) {
                return a.length === b.length && a.every((e, i) => {
                    return looseEqual(e, b[i]);
                });
            } else if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime();
            } else if (!isArrayA && !isArrayB) {
                const keysA = Object.keys(a);
                const keysB = Object.keys(b);
                return keysA.length === keysB.length && keysA.every((key) => {
                    return looseEqual(a[key], b[key]);
                });
            } else {
                return false;
            }
        } catch(e) { // 不支持 Array.prototype.every 的时候会返回false
            return false;
        }
    } else if (!isObjectA && !isObjectB) {
        return String(a) === String(b);
    } else {
        return false;
    }
}

/**
 * 返回数组arr中和v长得一样的元素的下标，没找到就返回-1
 * @param arr 数组
 * @param v 要寻找的元素
 */
export function looseIndexOf(arr: Array<any>, v: any): number {
    for (let i = 0; i < arr.length; i++) {
        if (looseEqual(arr[i], v)) return i;
    }
    return -1;
}

/**
 * 返回一个函数，这个函数即使多次调用，也只会执行一次fn
 * @param fn 目标函数
 */
export function once(fn: (a) => void): (...args) => void {
    let called = false; // 每个返回的函数都会闭包一个called
    return function(...args) {
        if (!called) {
            called = true;
            fn.apply(this, arguments);
        }
    }
}