import pruneAst from './pruneAst.js';
import TYPES from './node.type.js';

/** 匹配注释 */
const comment = /^<!--([\s\S]*?)-->/;
/** 匹配CDATA */
const cdata = /^<!\[CDATA\[([\s\S]*?)\]\]>/;
/** 匹配文本类型 */
const doctype = /^<!.*?>/;
/** 匹配文本 */
const text = /^[^<>]+/;

/** 匹配标签名称 */
const name = '[a-zA-Z_][\\w\\-]*';
/** 匹配结束标签 */
const endTag = new RegExp('^</(' + name + ')\\s*>');
/** 匹配开始标签 */
const startTag = new RegExp('^<(' + name + ')([\\s\\S]*?)>');
/** 单闭合标签名称 */
const singleTagName = ['meta','br','input','img','hr','base','textarea','link','frame','col','param','basefont','embed'];
/** 匹配具名简单标签 */
const singleTag = new RegExp('^<(' + singleTagName.join('|') + ')([\\s\\S]*?)>');
/** 匹配空白 */
const isBlank = /^\s*$/;

export default function parseToAst(template) {
    var scanner = new Scanner();
    var ast = Scanner.scan(template);
    return ast;
}
function Scanner() { }
Scanner.scan = function scan(template) {
    // 用于记录每层折叠的父节点 ast
    const stack = [];
    // ast 树
    const ast = { children: [] };
    // ast 树本身也属于一个父节点
    var parent = ast;
    // 最外层父节点入栈
    stack.push(parent);
    this.pos = 0;
    this.rest = template;
    while (this.pos < template.length) {
        // 匹配注释
        if (comment.test(this.rest)) {
            const match = this.rest.match(comment);
            const [str1, str2] = match;
            parent.children.push({
                tag: '',
                rawAttrs: str2,
                type: TYPES.COMMENT_TYPE
            });
            this.advance(str1.length);
            continue;
        }
        // 匹配 CDATA
        if (cdata.test(this.rest)) {
            const match = this.rest.match(cdata);
            const [str1, str2] = match;
            parent.children.push({
                tag: '',
                rawAttrs: str2,
                type: TYPES.CDATA_TYPE
            });
            this.advance(str1.length);
            continue;
        }
        // 匹配文档类型节点
        if (doctype.test(this.rest)) {
            parent.children.push({
                tag: '',
                rawAttrs: RegExp.$1,
                type: TYPES.DOCUMENT_TYPE_NODE
            });
            continue;
        }
        // 匹配文本
        if (text.test(this.rest)) {
            const str = this.rest.match(text)[0];
            if (isBlank.test(str)) {
                this.advance(str.length);
                continue;
            }
            parent.children.push({
                tag: '',
                rawAttrs: str,
                type: TYPES.TEXT_TYPE
            });
            this.advance(str.length);
            continue;
        }
        // 匹配单闭合标签
        if (singleTag.test(this.rest)) {
            // 匹配单闭合标签
            const match = this.rest.match(singleTag);
            var [str1, str2, str3] = match;
            // 去掉单闭合标签后面可能出现的“/”
            str3 = str3.trim().replace(/(\/+)$/, '');
            parent.children.push({
                tag: str2,
                rawAttrs: str3,
                type: TYPES.NODE_TYPE
            });
            this.advance(str1.length);
            continue;
        }
        // 匹配开始标签，生成其对应的 ast 对象
        // 当前栈顶存放的父节点将标签生成的 ast 对象添加到它的 children 中
        // 将 parent 指向标签对应的 ast 对象，并入栈
        if (startTag.test(this.rest)) {
            const match = this.rest.match(startTag);
            const [str1, str2, str3] = match;
            var o = {
                tag: str2,
                rawAttrs: str3,
                type: TYPES.NODE_TYPE,
                children: []
            };
            parent.children.push(o);
            stack.push(parent = o);
            this.advance(str1.length);
            continue;
        }
        // 匹配到结束标签，判断当前栈顶 ast 对象的标签是否和结束标签是否一致
        // 不一致则报错提示闭合异常
        // 一致则弹栈，将当前 parent 恢复到上一层的 parent
        if (endTag.test(this.rest)) {
            const match = this.rest.match(endTag);
            const [str1, str2] = match;
            var top = stack[stack.length - 1];
            if (top.tag !== str2 && !singleTagName.includes(str2)) {
                throw Error(`start tag is '${top.tag}', but got the end tag is '${str2}.'`);
            }
            stack.pop();
            parent = stack[stack.length - 1];
            this.advance(str1.length);
            continue;
        }
        // 都不满足的情况下，向后偏移一位
        this.advance(1);
    }
    return pruneAst(ast);
}
Scanner.advance = function advance(n) {
    this.pos += n;
    this.rest = this.rest.substr(n);
}