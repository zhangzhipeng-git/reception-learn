import TYPES from './node.type.js';

/** 普通属性名 */
const key = '[a-zA-Z_][\\w\\-]*';
/** 普通属性键 */
const commonKey = new RegExp('^(' + key + ')\\s+');
/** 普通属性键值 */
const commKeyValue = new RegExp('^(' + key + ')' + '="([^"]*)"');
/** 输入属性键值 */
const inputKeyValue = new RegExp('^:(' + key + ')' + '="([^"]*)"');
/** 输出属性键值 */
const outputKeyValue = new RegExp('^@(' + key + ')' + '="([^"]*)"');
/** 花括号 */
const expr = /^\{\{([^\}]+)\}\}/;
/** 非花括号 */
const notExpr = /^([^\{\}]+)/;
/**
 * 处理抽象语法树
 * @param {*} ast 抽象语法树
 */
export default function pruneAst(ast) {
    var asts = ast.children;
    prune(asts);
    return asts;
}
/**
 * 递归处理语法树对象
 * @param {*} asts 抽象语法树
 */
function prune(asts) {
    asts.map(ast => {
        ast.rawAttrs = ast.rawAttrs.trim();
        const type = ast.type;
        // 节点类型
        if (type === TYPES.NODE_TYPE) {
            ast.data = NodeScanner.scan(ast.rawAttrs);
        } else if (type === TYPES.TEXT_TYPE) {
            // 文本类型
            ast.data = TextScanner.scan(ast.rawAttrs);
        }
        const childs = ast.children;
        // 没有子节点
        if (isArrBlank(childs)) {
            return;
        }
        prune(childs);
    })
}
/**
 * 判断是否空的数组
 * @param {*} arr 数组
 */
function isArrBlank(arr) {
    return !arr || !arr.length;
}
/**
 * 针对节点的扫描器，处理绑定语法
 */
function NodeScanner() { }
NodeScanner.scan = function scan(str) {
    const data = { attrs: {}, props: {}, emits: {} };
    this.rest = str;
    this.pos = 0;
    while (this.pos < str.length) {
        // 匹配普通属性
        if (commonKey.test(this.rest)) {
            const key = RegExp.$1;
            data.attrs[key] = undefined;
            this.advance(key.length);
            continue;
        }
        // 匹配普通属性键值
        if (commKeyValue.test(this.rest)) {
            const match = this.rest.match(commKeyValue);
            const [kv, key, value] = match;
            data.attrs[key] = value;
            this.advance(kv.length);
            continue;
        }
        // 匹配输入属性键值对
        if (inputKeyValue.test(this.rest)) {
            const match = this.rest.match(inputKeyValue);
            const [kv, key, value] = match;
            data.attrs[key] = value;
            data.props[key] = value;
            this.advance(kv.length);
            continue;
        }
        // 匹配输出属性键值对
        if (outputKeyValue.test(this.rest)) {
            const match = this.rest.match(outputKeyValue);
            const [kv, key, value] = match;
            data.attrs[key] = value;
            data.emits[key] = value;
            this.advance(kv.length);
            continue;
        }
        this.advance(1);
    }
    return data;
}
/**
 * 指针后移n位，同时截取剩下的字符串
 * @param {*} n 前进n位
 */
NodeScanner.advance = function advance(n) {
    this.pos += n;
    this.rest = this.rest.substr(n);
}
/**
 * 针对文本节点的扫描器，处理绑定语法
 */
function TextScanner() { }
TextScanner.scan = function scan(str) {
    const data = [];
    this.pos = 0;
    this.rest = str;
    while (this.pos < str.length) {
        // 匹配 {{}}
        if (expr.test(this.rest)) {
            const exp = RegExp.$1;
            data.push({ exp });
            this.advance(exp.length + 4);
            continue;
        }
        // 匹配非 {，}
        if (notExpr.test(this.rest)) {
            const txt = RegExp.$1;
            data.push(txt);
            this.advance(txt.length);
            continue;
        }
        this.advance(1);
    }
    return data;
}
TextScanner.advance = NodeScanner.advance;