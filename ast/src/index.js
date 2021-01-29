import parseToAst from './parseToAst.js';
var template = `<!-- 注释节点1 -->
<input
:class="{a: true}"
/>
>
开头文本节点
<span>span标签的文本</span>
<ul>
<br/>
    <!-- 注释节点2 
        // dskaljdfa
        // djkaldfjkaf

        <div>wefjaldfka</div>
    -->
    <![CDATA[ dafjdkalfk
    dklajfldaf
djklajfdk ]]>
    ul标签{{sss}}的第一个文本本节点
    <div
    >ul标签里面的的div标签</div>
    ul标签的第二个文本本节点{{this.aaa}}
    <li v-for="i in 10" :key="i" attr1>
        <ol>
            <li v-for="j in 5" :key="j" attr2>\
                最内层li标签的文本
            </li>
        </ol>
    </li>
    <br/>
</ul>`;
var ast = parseToAst(template);
console.log(ast);