/**
 * 深克隆
 * @param {*} obj 目标值
 * @returns 
 */
 function deepClone(obj) {
    // 记录每个属性值在根对象的路径
    var MAP = {};
    // 匹配函数
    var FUN_REG = /\((.*?)\)(.|\r|\n)*?\{((.|\r|\n)*)\}/m;

    /**
     * 需要将目标值的路径记录到 MAP 中
     * @param {*} o 目标值
     * @returns 
     */
    function needRecord(o) {
        return o && (typeof o === 'object' || typeof o === 'function');
    }

    /**
     * 克隆
     * @param {*} obj 目标值
     * @param {*} path 属性的路径栈，如 var o = {a:{b:1}}, 
     * 则 1 对应的 path 为 ['a', 'b']，它存储到 MAP 上的键值
     * 对为：{'a.b': 1}
     * @returns 
     */
    function clone(obj, path) {
        if (obj == null) { return obj; }
        var type = typeof obj;
        // 其他非引用类型
        if (type !== 'object' && type !== 'function') {
            return obj;
        }

        // 克隆结果
        var o;
        // 对象构造器的名称
        var cn = obj.constructor && obj.constructor.name;

        // 已经克隆过，直接找到已经克隆过的对象并返回
        // 将“源对象的自身属性引用”这中引用关系也克隆一下
        if (obj.__cloned__) {
            delete obj.__cloned__;
            return MAP[path.join('.')];
        }
        // 标记已克隆，防止引用自身属性造成死循环克隆
        Object.defineProperty(obj, '__cloned__', {
            value: true,
            enumerable: false,
            configurable: true
        });

        // 当path不存在时，path 是根对象的路径栈
        if (path == undefined) { path = []; }
        // 克隆函数、正则、基本类型的包装类型、日期、数组和对象
        if (type === 'function') {
            // 函数
            var fstr = obj.toString();
            var matches = fstr.match(FUN_REG);
            var fargs = matches[1].split(',');
            var fbody = matches[3];
            if (fbody) { fargs.push(fbody); }
            o = Function.apply(obj, fargs);
        } else if (cn === 'String' || cn === 'Boolean' || cn === 'Number') {
            // 基本类型的包装类型
            o = new obj.constructor(cn.valueOf());
        } else if (obj instanceof RegExp) {
            // 正则
            var i = obj.ignoreCase;
            var m = obj.multiline;
            var g = obj.global;
            var options = [];
            if (i) { options.push('i'); }
            if (m) { options.push('m'); }
            if (g) { options.push('g'); }
            var regStr = (obj.source).replace(/\\/g, '\\');
            o = new RegExp(regStr, options.join(''));
        } else if (obj instanceof Date) {
            // 日期
            var t = obj.getTime();
            o = new Date(t);
        } else if (Array.isArray(obj)) {
            // 数组
            o = [];
            // 根对象
            if (!MAP['']) { MAP[''] = o; }
            obj.forEach((e, k) => {
                path.push(k)
                o[k] = clone(e, path);
                if (needRecord(o[k])) { MAP[path.join('.')] = o[k]; }
                path.pop();
            });
        } else {
            // 对象
            o = {};
            // 根对象
            if (!MAP['']) { MAP[''] = o; }
            for (var k in obj) {
                path.push(k)
                o[k] = clone(obj[k], path);
                if (needRecord(o[k])) { MAP[path.join('.')] = o[k]; }
                path.pop();
            }
        }
        if (obj.__cloned__) {
            delete obj.__cloned__;
        }
        return o;
    }
    return clone(obj);
}

var src = {
    a: 1,
    b: new Boolean(true),
    null: () => {
        var a = 2;
        function b() {
            console.log(a);
        }
    },
    c: /\s*/,
    d: new Date,
    e: new String('xxx'),
    f: [],
    g: [{
        a: 1,
        b: 2
    }]
}

src.x = src;
src.f[0] = src.g;
src.g[0].xx = src.d;
var c = deepClone(src);
c.x = 2;
console.log(c);
console.log(src);