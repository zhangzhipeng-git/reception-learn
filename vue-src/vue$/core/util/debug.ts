/* @flow */

import config from '../config';
import { noop } from '../../shared/util';

/** 
 * 警告，默认是个空函数，在 debug.ts 中定义为一个函数：
 * 打印 msg + 组件追踪轨迹（即告知开发者哪个组件下的组件有问题）
 */
export let warn = noop
/** 提示 */
export let tip = noop
/** 生成组件树追踪轨迹 */
export let generateComponentTrace = noop // work around flow check
/** 格式化组件名称 */
export let formatComponentName = noop

// 开发环境
if (process.env.NODE_ENV !== 'production') {
    // 是否有 console 函数
    const hasConsole = typeof console !== 'undefined'
    // 匹配-_后面的字符串，如将'a_b'变为'AB',将'-a'变为'A'
    /** 格式化组件名称为类名格式 */
    const classifyRE = /(?:^|[-_])(\w)/g
    const classify = str => str
        .replace(classifyRE, c => c.toUpperCase())
        .replace(/[-_]/g, '')
    /** 警告，打印 msg + 组件追踪轨迹（即告知开发者哪个组件下的组件有问题） */
    warn = (msg, vm) => {
        const trace = vm ? generateComponentTrace(vm) : ''
        // 如果配置中定义了 warn 则使用配置中的 warn 函数
        // 没有则使用 console.error 代替，并且配置中 slient 为假时才打印
        if (config.warnHandler) {
            config.warnHandler.call(null, msg, vm, trace)
        } else if (hasConsole && (!config.silent)) {
            console.error(`[Vue warn]: ${msg}${trace}`)
        }
    }

    tip = (msg, vm) => {
        if (hasConsole && (!config.silent)) {
            console.warn(`[Vue tip]: ${msg}` + (
                vm ? generateComponentTrace(vm) : ''
            ))
        }
    }

    /**
     * 格式化组件名称
     * @param vm {Vue} 组件函数或组件实例
     * @param includeFile 不传值为 undefined 
     */
    formatComponentName = (vm, includeFile) => {
        // 根节点
        if (vm.$root === vm) {
            return '<Root>'
        }
        // 如果是函数且有id，则取它的 options，
        // 如果不是函数或没有 id，判断是否有 _isVue 属性，
        // 如果有，则说明是 组件实例，取它的 options 或构造器的 options ，
        // 如果没有则取它自己。
        const options = typeof vm === 'function' && vm.cid != null
            ? vm.options
            : vm._isVue
                ? vm.$options || vm.constructor.options
                : vm
        // 得到组件的名称
        let name = options.name || options._componentTag
        // 得到文件名称
        const file = options.__file
        // 如果没有组件名称则根据 .vue 文件名称获取组件名称 
        if (!name && file) {
            const match = file.match(/([^/\\]+)\.vue$/)
            name = match && match[1]
        }
        // 如果组件名称还是未定义，返回未知组件，
        // 有则返回组件标签和它的所在文件
        return (
            (name ? `<${classify(name)}>` : `<Anonymous>`) +
            (file && includeFile !== false ? ` at ${file}` : '')
        )
    }
    // 字符串str重复n次，如 es6 的 str.repeat(n)
    // 开始感觉这个函数很奇怪，但是可以参考这个来理解：
    // https://segmentfault.com/q/1010000023781704
    // 假设要重复 n 次，设循环次数为 x ，则 2^x = n;
    // 则循环次数 = 以 2 为底 n 的对数，即时间复杂度为 O(log n)
    const repeat = (str, n) => {
        let res = ''
        /**
         * 从 n 的二进制低位向高位遍历
         * 如重复 a 字符 13 次
         * 
         * 二进制位：| 1 | 1 | 0 | 1 |
         * 进制基数：| 8 | 4 | 2 | 1 |
         * 中间结果：|8*a|4*a|2*a|1*a|
         * 
         * res = 8*a + 4*a + 2*a + 1*a
         */
        // 第一位时，中间结果为 str
        while (n) {
            // 如果当前位不为 0，则结果 res 累加中间结果 str
            if (n % 2 === 1) res += str
            // 如果不是第一位，中间结果 str 翻倍（变为上一位字符串的两倍）
            if (n > 1) str += str
            // 右移一位（向高位移动）
            n >>= 1
        }
        return res
    }
    /**
     * 生成组件树追踪轨迹
     */
    generateComponentTrace = vm => {
        if (vm._isVue && vm.$parent) {
            // 组件树追踪栈
            const tree = []
            // 组件使用自身为子组件的层数
            let currentRecursiveSequence = 0
            while (vm) {
                if (tree.length > 0) {
                    const last = tree[tree.length - 1]
                    // 这一步说明存在自我递归组件（如菜单树组件）
                    if (last.constructor === vm.constructor) {
                        // 该组件递归使用的层级
                        currentRecursiveSequence++
                        vm = vm.$parent
                        continue
                    } else if (currentRecursiveSequence > 0) {
                        // 如果存在自我递归使用的组件，则该项变为一个数组
                        // 数组第一项为该组件实例，第二项为自我递归使用层数
                        tree[tree.length - 1] = [last, currentRecursiveSequence]
                        // 重置层数
                        currentRecursiveSequence = 0
                    }
                }
                tree.push(vm)
                vm = vm.$parent
            }
            return '\n\nfound in\n\n' + tree
                .map((vm, i) => `${i === 0 ? '---> ' : repeat(' ', 5 + i * 2) // 第一层为 --->，2 层及以上为空白
                    }${Array.isArray(vm)
                        ? `${formatComponentName(vm[0])}... (${vm[1]} recursive calls)`
                        : formatComponentName(vm)
                    }`)
                .join('\n')
        } else {
            return `\n\n(found in ${formatComponentName(vm)})`
        }
    }
}
