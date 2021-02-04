/**
 * 解析template中绑定的函数
 * 会依据平台生成web端和native端的函数执行器
 * 根据函数修饰符进行条件判断，组装生成代码
 */


/** 匹配函数的正则，如_abc$ => , () => , function abc( , function( */
const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;

/** 匹配函数调用正则， 如：(); (abc); */
const fnInvokeRE = /\([^)]*?\);*$/;

/** 简单路径？ */
const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

const keyCodes = {
    esc: 27,
    tab: 9,
    enter: 13,
    space: 32,
    up: 38,
    left: 37,
    right: 39,
    down: 40,
    'delete': [8, 46]
}

/** 按键别名 */
const keyNames = {
    // #7880: IE11 and Edge use `Esc` for Escape key name.
    esc: ['Esc', 'Escape'],
    tab: 'Tab',
    enter: 'Enter',
    // #9112: IE11 uses `Spacebar` for Space key name.
    space: [' ', 'Spacebar'],
    // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
    up: ['Up', 'ArrowUp'],
    left: ['Left', 'ArrowLeft'],
    right: ['Right', 'ArrowRight'],
    down: ['Down', 'ArrowDown'],
    // #9112: IE11 uses `Del` for Delete key name.
    'delete': ['Backspace', 'Delete', 'Del']
}

/** 阻止监听器的执行（为某些修饰符生成一段代码，决定后续要不要执行）, condition为true时retrun nul */
const genGuard = condition => `if(${condition})return null`;

/** 修饰符对应的代码片段 */
const modifierCode = {
    stop: '$event.stopPropagation();',
    prevent: '$event.preventDefault();',
    self: genGuard(`$event.target !== $event.currentTarget`),
    ctrl: genGuard(`!$event.ctrlKey`),
    shift: genGuard(`!$event.shiftKey`),
    alt: genGuard(`!$event.altKey`),
    meta: genGuard(`!$event.metaKey`),
    left: genGuard(`'button' in $event && $event.button !== 0`),
    middle: genGuard(`'button' in $event && $event.button !== 1`),
    right: genGuard(`'button' in $event && $event.button !== 2`)
};

/**
 * 为ast语法树元素生成函数执行器集合
 * @param events ast树元素绑定的原始函数集合
 * @param isNative 是否原生事件
 */
export function genHandlers(events: any, isNative: boolean): string {
    const prefix = isNative ? 'nativeOn:' : 'on:';
    let staticHandlers = ``;
    let dynamicHandlers = ``;
    for (const name in events) {
        const handlerCode = genHandler(events[name]);
        if (events[name] && events[name].dynamic) {
            dynamicHandlers += `${name},${handlerCode},`;
        } else {
            staticHandlers +=   `"${name}":${handlerCode},`;
        };
    }
    staticHandlers = `{${staticHandlers.slice(0,-1)}}`;
    if (dynamicHandlers) {
        return prefix + `_d(${staticHandlers},[${dynamicHandlers.slice(0,-1)}])`;
    }
}

/**
 * 生成微信端的执行器
 * @param params 参数
 * @param handlerCode  
 */
function genWeexHandler(params: Array<any>, handlerCode: string) {
    let innerHandlerCode = handlerCode;
    const exps = params.filter(exp => simplePathRE.test(exp) && exp !== '$event');
    const bindings = exps.map(exp => ({'@binding': exp}));
    const args = exps.map((exp, i) => {
        const key = `$_${i+1}`;
        innerHandlerCode = innerHandlerCode.replace(exp, key)
        return key;
    });
    args.push('$event');
    return '{\n' +
        `handler:function(${args.join(',')}){${innerHandlerCode}}, \n` +
        `params:${JSON.stringify(bindings)}\n` +
        '}';
}

/**
 * 生成函数执行器
 * @param handler 
 */
function genHandler(handler: any) {
    if (!handler) { // 无执行器，返回一个空函数
        return 'function(){}';
    }
    if (Array.isArray(handler)) {
        return `[${handler.map(handler => genHandler(handler).join(','))}]`;
    }
    /** 函数的路径 */
    const isMethodPath = simplePathRE.test(handler.value);
    /** 函数表达式 */
    const isFunctionExpression = fnExpRE.test(handler.value);
    /** 函数调用 */
    const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));

    if (!handler.modifiers) { // 函数没有修饰符
        if (isMethodPath || isFunctionExpression) {
            return handler.value;
        }
        // @ts-ignore
        if (__WEEX__ && handler.params) { // native环境 && 函数有绑定参数
            return genWeexHandler(handler.params, handler.value);
        }
        // 非native端 且 没有参数，默认将事件参数传入
        return `function($event){${
            isFunctionInvocation ? `return ${handler.value}` : handler.value    
        }}`;
    } else { // 有函数生成器
        let code = '';
        let genModifierCode = '';
        const keys = [];
        // 组装修饰器对应的代码片段
        for (const key in handler.modifiers) {
            if (modifierCode[key]) {
                genModifierCode += modifierCode[key]; 
                // 如果按键有对应的数字则将该按键放入一个数组keys中
                if (keyCodes[key]) {
                    keys.push(key);
                }
            } else if (key === 'exact') {
                /**
                 * <!-- 有且只有 Ctrl 被按下的时候才触发 -->
                 * <button @click.ctrl.exact="onCtrlClick">A</button>
                 * <!-- 没有任何系统修饰符被按下的时候才触发 -->
                 * <button @click.exact="onClick">A</button>
                 */
                const modifiers: any = handler.modifiers;
                genModifierCode += genGuard(
                    ['ctrl', 'shift', 'alt', 'meta']
                    // 1.将'ctrl', 'shift', 'alt', 'meta'中不在handler的修饰符过滤出来
                    .filter(keyModifier => !modifiers[keyModifier])
                    // 2.将过滤后的修饰符变成`$event.${modifier}Key`
                    .map(keyModifier => `$event.${keyModifier}Key`)
                    .join('||')
                );
            } else { // 其他修饰符
                keys.push(key);
            }
        }
        if (keys.length) {
            code += genKeyFilter(keys);
        }
        if (genModifierCode) {
            code += genModifierCode;
        }
        const handlerCode = isMethodPath
        ? `return ${handler.value}($event)`
        : isFunctionExpression
          ? `return ${handler.value}($event)`
          : isFunctionInvocation
            ? `return ${handler.value}`
            : handler.value;
        // @ts-ignore
        if (__WEEX__ && handler.params) {
            return genWeexHandler(handler.params, code + handlerCode);
        }
        return `function($event)${code}${handlerCode}`;
    }
}

/**
 * 如果不是按键事件且事件的keyCode不等于按键对应的数值，则返回null
 * @param keys 按键key
 */
function genKeyFilter(keys: Array<string>): string {
    // 如果不是按键事件并且keycode和按键的数值不等，则返回null
    return (
        `if(!$event.type.indexOf('key') &&` +
        `${keys.map(genFilterCode).join('&&')})return null;`
    );
}

/**
 * 判断事件的keyCode是否等于按键的数值
 * @param key 按键key
 */
function genFilterCode(key: string) {
    const keyVal = parseInt(key, 10);
    if (keyVal) { // 如果修饰符是数字，判断用户按键的数值是否和keyVal相等
        return  `$event.keyCode !==${keyVal}`
    }
    // 修饰符是'esc'或其别名等等
    const keyCode = keyCodes[key];
    const keyName = keyNames[key];
    // _k是一个函数，目前只知道是返回布尔类型
    return (
        `_k($event.keyCode,` +
        `${JSON.stringify(key)},` +
        `${JSON.stringify(keyCode)},` +
        `$event.key,` +
        `${JSON.stringify(keyName)}` +
        `)`
    );
}