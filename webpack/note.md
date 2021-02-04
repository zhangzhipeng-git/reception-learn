# 1

## webpack 安装
- 安装本地的webpack
- wepack webpack-cli

## webapack 可以斤进行0配置
- 打包工具 -> 输出后的结果（js模块）
- 打包（支持我们的js模块）

## 手动配置webpack
 - 默认配置文件的名字：webpack.config.js 或 webpackfile.js
 - 修改配置文件的名字后如何打包？
   - 1. 命令行 npx webpack --config 自定义配置文件名称
   - 2. 在package.json文件的scripts脚本命令中添加键值对 key: "webapck --config 自定义配置文件名称", 然后执行npm run 脚本key

** 另外 npm run 脚本传参 npm run 脚本key -- 参数
   如：npm run build -- --config my.webpack.conf.js

** npx的产生及使用 http://www.ruanyifeng.com/blog/2019/02/npx.html
    1.node5.2以后随npm出现的一个命令
    2.原理和npm类似，可将当前node_modules中.bin的命令添加到环境变量执行或直接执行环境变量中的变量，不同的是npx会在找不到该命令时下载该模块并执行，可指定--no-install禁止下载

# 2

## 配置开发的服务器
 - 安装webppack-dev-server
 - 配置webpack配置文件中devServer键值
 - 使用npx webpack-dev-server 启动服务器后访问会默认访问当前项目根路径
 - 其作用是将文件打包到内存中，并启动服务器

# 3

## 插件之HtmlWebpakPlugin
 - 可以指定index.html模板的位置
 - 可以配置index.html打包后的名称

# 4 

## 样式处理
 - css-loader 支持@import
 - style-loader 将css插到head中，可查看官方英文文档，中文文档更新较慢
 - mini-css-extract-plugin 抽离css
 - postcss-loader autofrefixer 自动加前缀，要在css-loader前执行
   - 使用postcss-loader加载器，需要一个postcss.config.js文件，用它可以引入其它插件对css文件进行预处理，至此得出一个结论插件和loader可以互相使用，可以通过一个插件得到一个loader，如mini-css-extract-plugin，也可以在loader里使用插件，如postcss-loader加载器通过配置文件来引入插件，其实也可以实现一个在options里传入参数的loader来调用指定的插件。

# 5 
 
## 对打包后的文件进行优化处理
 - 使用配置文件的optimization 选项进行配置，常用的子选项为minimizer，可传入插件对文件进行压缩

# 6

## js处理模块
 - babel es6 -> es5 安装babel-loader 需要@babel/core @babel/preset-env
 - babel 编译class和装饰器，需要安装@babel/plugin-proposal-decorators和@babel/plugin-proposal-class-properties
 - runtime api 运行时api ，浏览器会找不到如Promise generator函数转化后的函数，需要开发安装@babel/plugin-transform-runtime插件和生产安装@babel/runtime
 - "@babel/plugin-transform-runtime", // 将es6的一些新特性变成特定api，需要生产安装@babel/runtime，生产api的腻子脚本，注意不包含实例的新语法，如'aa'.includes('a'),需要额外生产安装@babel/polyfill，使用时引入,而@babel/runtime貌似是打包时自动引入了。。。

** 番外 ts vscode插件提示报错，settings -> extensions -> typescript -> 勾上选项enable/disable javascript experimentalDecorators

# 7 

## 语法校验及配置 
 - eslint eslint-loader

# 8

## 全局变量引入问题
 - __webpack_require__引入的是一个闭包，比如在某个文件中import $ from jquery; 这里的$并不会挂载到window或global上，所以要额外使用expose-loader把$暴露出去
 - 有3中方式可以将全局变量暴露出去
  - 1.expose-loader 将全局变量挂到window上
  - 2.使用webpack内部的providePlugin给每个人提供一个$
  - 3.外部引入不打包，cdn加速

# 9

## webpack 打包图片
 - 在js中创建图片来引入
 - css中background引入
 - img标签引入
 - 可以使用file-loader将文件加载处理到打包目录的相关文件中，并解析文件新的hash地址返回出去 如 import newUrl from './logo.png';
 - 解析html中url 使用html-withimg-loader 如index.html中img的src，使用插件后会将图片放到打包目录下，并将路径进行转换
 - url-loader, 小于规定大小的会变成base64，大于规定大小的文件会使用file-loader

# 10

## 打包文件分类
 - 设置loader选项的outputPath和filename（如filename:'css/main.css'）
 - publicPath，会在静态资源路径前面加上它，可在output中指定或options中指定

``` js

    options: {
      outputPath:'js/',
      publicPath:'http://www.xx.xx.cn/'
    }
   ```

``` js

    output: {
      filename:'vender.js',
      path: path.resolve(__dirname, './build/'),
      publicPath:'http://www.xx.xx.cn/'
    }
   ```


# 12 多页配置
 - 多出口多入口,new 多个HtmlWebpackPlugin配置页面，使用chunks配置引入入口名对应的js

# 13 配置source-map
 - sorceMap是方便压缩文件进行调式，是源码的映射，报错会显示行和列
 - 在webpack中可以通过devtool进行设置
   - 1.devtool:'source-map' 会产生map文件，报错显示行和列
   - 2.devtool:'eval-source-map' 不会产生map文件集成在打包文件中，报错显示行和列
   - 3.devtool: 'cheap-module-source-map' 产生map文件，报错只显示行不显示列
   - 4.devtool: 'cheap-module-eval-source-map' 不产生map文件集成在打包文件中，报错只显示行不显示列

# 14 实时打包文件
 - watch 修改实时打包文件

  ``` js

  watch: true,
    watchOptions: {
        poll: 1000, // 每秒问我一千次
        aggreatement: 500 , // 我一直输入代码 ，防抖
        ignored: /node_modules/ // 排除监视的文件
    },
  ```

# 15 webpack 小插件
 - cleanWebpackPlugin - 需要第三方模块
 - copyWebpackPlugin - 需要第三方模块
 - bannerPlugin - 内置的


# 16 配置服务
 - devServer 配置代理
 - devServer before函数实现本地mock
 - 开发本地服务，使用webpack-dev-middleware 中间件集成webpack开发，用服务启动webpack-dev-server

# 17 resolve属性配置
 ``` js

 resolve: {
   modules: [path.resolve('node_modules')], // 指定模块的查找目录
   alias: { // 方便引入其他文件，如下例使用@表示./src
     @: './src'
   },
   mainFields: ['style', 'main'], // 先找style（css），再找main（js）
   mainFiles: [], // 文件的入口名字 默认是 index.js
   extentions: ['.js','.ts'] // 引入文件不写后缀，按照从左到右的顺序找带该后缀的文件，nodejs中模块引入也有类似的特性
 }
```


# 17 定义环境变量 

 ``` js

  new webapck.DefinePlugin({
   DEV: JSON.stringify('production'),  // 将字符串类型DEV替换为 'production'
   FLAG: 'true', // 将布尔类型GLAG替换为true
   EXPRESSION: '1+1' // 将表达式EXPRESSION替换为2
 })

# 18 区分不同环境
 - webpack-merge 合并webpack配置
``` js

  var {merge} = require('webpack-merge');
  var base = require('./webpack.config.base');

  module.exports = merge(base, {
      mode: 'production'
  })
```
# 19 设置module属性的noParse
 - 不解析哪些模块的依赖 如jquery
``` js

module: { // 模块
    noParse: /jquery/
}
```

# 20 IgnorePlugin插件 忽略引入

``` js

new webpack.IgnorePlugin(/\.\/locale/,/moment/) // 忽略moment模块中./locale的引入
```
# 21 dllPlugin
 - library: 'ab' 指定出口模块的返回名
 - libraryTarget: 'var'  // 以变量的形式返回 var ab = (function(){})([]),还有commonjs module.exports['ab']=(function(){[]})()，commonjs2，this，umd等等
 - dllPlugin 动态链接库，可以被其他模块引入使用

``` js

mode:'development',
    entry: {
        // test_react: './src/test_react.js',
        react: ['react','react-dom']
    },
    output: {
        filename: '__dll__[name].js',
        path: path.resolve(__dirname,'./dist2'),
        library: '__dll__[name]', // 模块返回值
        // libraryTarget: 'var' // umd, commonjs, this, amd, var // 返回模式
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.resolve(__dirname, 'dist2', 'manifest.json'), // 指定dll清单的位置和名字
            name: '__dll__[name]', // 匹配dll清单对应的打包文件
        })
    ],
```

  - DllReferencePlugin 看引入的模块能不能在dll清单里找到，找到就不对该模块进行打包（在index.html中引入打包后的dll js文件后，可以直接使用该模块，是通过manifest进行对接的），找不到则打包，如果能在任务清单中找到对应的模块，则不对其打包


``` js ( 使用另一个配置文件进行打包)

entry: {
        index: './src/index.js',
        other: './src/other.js',
    },
  output: {
      // filename: 'bundle.js', // 打包后文件名，加入hash防止文件缓存,即每次修改文件后都会产生一个新的文件,:8是取8位hash
      filename: '[name].js',
      path: path.resolve(__dirname, './dist/') // 打包后的文件路径， 必须是绝对路径
  },
  plugins: [
      new CleanWebpackPlugin(),
      new webpack.DllReferencePlugin({
          manifest: path.resolve(__dirname, 'dist2', 'manifest.json') // 解析dll清单，看引入的模块在不在里面，有则不打包，然后引入是执行类似__dll__react.m[module.id]的函数
      }),
  ]

** 在vue-ssr渲染中有使用到...

# 22 多线程打包
 - happypack
``` js
    plugins: [
        new webpack.DllPlugin({
            path: path.resolve(__dirname, 'dist2', 'manifest.json'),
            name: '__dll__[name]', // 找到任务清单对应的打包文件
        }),
        new Happypack({
            id: 'js',
            use: [
                {
                    loader: 'babel-loader', // es6 -> es5
                    options: {
                        presets: [
                            '@babel/preset-env', // 预设置 解析es6 -> es5 （不包含类，装饰器，和新特性Promise和遍历生成器函数）
                            '@babel/preset-react' // 预设值 解析react语法
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-decorators", { "legacy": true }], // 解析装饰器
                            ["@babel/plugin-proposal-class-properties", { "loose" : true }], // 解析类class
                            "@babel/plugin-transform-runtime", // 将es6的一些新特性变成特定api，需要生产安装@babel/runtime，生产api的腻子脚本，注意不包含实例的新语法，如'aa'.includes('a'),需要额外生产安装@babel/profill，使用时引入
                        ],
                    }
                }
            ]
        }),
    ],
    module: {
        rules: [
            {
                test:/\.js$/,
                use: 'Happypack/loader?id=js',
                include: path.resolve(__dirname, './src'), // 指定文件目录使用加载器
                exclude: /node_modules/ // 排除不需要处理的文件目录
            },
        ]
    }
```

# 23 wepback 自带打包优化
 - 在生产环境中，会自动去除没有用到的代码
 - tree-shaking 把没有用到的代码 自动删除掉（但是不能作用在require上，使用import才会生效？？）
 - scope hosting 作用域提升，会自动计算已知的变量等

# 24 抽离公共代码
 - 在webpack4之前使用commonChunkPlugins插件
 - 在webpack4时，使用优化向splitChunks

``` js
 optimization: {
   splitChunks: {
     // 这一层的是分割
     cacheGroups: { // 缓存组，是合并成了公共文件，相当于缓存？？
       common: {
         chunks: 'initial',
         minSize: 0,
         minChunks: 2,
       },
       vender: {
         priority: 1, // 优先级，第一个执行
         name: 'vender.bundle.js', // 抽离的文件名
         test: /node_modules/, // 是第三方模块
         chunks: 'initial', // 初始块 ，还有async块和all （没搞懂。。。）
         minSize: 0,    // 大于0个字节
         minChunks: 2    // 被使用两次及以上
       }
     }
   }
 }
```

# 25 懒加载 - 通过webapckJsonp实现
 - @babel/plugin-syntax-dynamic-import 

``` js

import('./xx.js').then((data) => {
  console.log(data.default);
})
```

# 26 热更新 - 只更新一部分，不更新整个页面
``` js
  devServer: {
    hot: true // 开发服务器开启热更新
  }
  plugins: [
    new webpack.NamedModulesPlugin(), // 打印更新的模块的路径
    new webpack.HotModuleReplacementPlugin() // 热更新插件
  ]
```

``` JS
  // 修改本模块和./a.js都会引起热更新
  if (module.hot) {
    module.hot.accept('./a.js', () => {
      console.log('文件更新了');
      // 重新执行该文件
      require('./a.js');
    })
  }
```

# 27 tapable
 - 类似于nodejs的events库，核心原理是依赖发布订阅模式，观察者模式

# 28 造轮子...