var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin'); // 处理index.html文件
var MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离css
var OptimizeCss = require('optimize-css-assets-webpack-plugin'); // 压缩css，可设置选项
var UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // 压缩js，可设置选项
// /************1-start *****************************/
// module.exports = {
//     mode: 'development', // 模式 默认两种 production（压缩） development（不压缩）
//     entry: './src/index.js', // 入口
//     output: {
//         filename: 'bundle.js', // 打包后文件名
//         path: path.resolve(__dirname, './dist/') // 打包后的文件路径， 必须是绝对路径
//     }
// }
// /************1-end *****************************/

// /************2-start *****************************/
// module.exports = {
//     devServer: {  // 内存中打包
//         port: 3000 ,   // 指定开发服务器的端口
//         progress: true, // 显示进度条
//         contentBase: './build' ,// 指定访问静态资源的目录
//         open: true,         // 自动打开浏览器
//         compress: true     // 启用gzip压缩
//     },
//     mode: 'development', // 模式 默认两种 production（压缩） development（不压缩）
//     entry: './src/index.js', // 入口
//     output: {
//         filename: 'bundle.js', // 打包后文件名
//         path: path.resolve(__dirname, './dist/') // 打包后的文件路径， 必须是绝对路径
//     }
// }
// /************2-end *****************************/

// /************3-start *****************************/
// module.exports = {
//     devServer: {
//         port: 3000 ,   // 指定开发服务器的端口
//         progress: true, // 显示进度条
//         contentBase: './build' ,// 指定内存中访问根目录，不加该路径会默认访问index.html
//         open: true,         // 自动打开浏览器
//         compress: true     // 启用gzip压缩
//     },
//     mode: 'development', // 模式 默认两种 production（压缩） development（不压缩）
//     entry: './src/index.js', // 入口
//     output: {
//         filename: 'bundle.[hash:8].js', // 打包后文件名，加入hash防止文件缓存,即每次修改文件后都会产生一个新的文件,:8是取8位hash
//         path: path.resolve(__dirname, './build/') // 打包后的文件路径， 必须是绝对路径
//     },
//     plugins: [
//         new HtmlWebpackPlugin({
//             template: './src/index.html', // 指定index.html模板位置
//             filename: 'index.html'  ,       // 指定打包后文件名
//             minify: {
//                 removeAttributeQuotes: true, // 去掉html中的可以去掉的属性中双引号
//                 collapseWhitespace: true    // 去掉空格变成一行
//             },
//             hash: true    // 引入静态资源时加入时间戳防止缓存
//         }),
        
//     ]
// }
// /************3 - end *****************************/

// /************4 - start *****************************/
module.exports = {
    mode: 'development', // 模式 默认两种 production（压缩） development（不压缩）
    entry: './src/index.js', // 入口
    output: {
        filename: 'bundle.[hash:8].js', // 打包后文件名，加入hash防止文件缓存,即每次修改文件后都会产生一个新的文件,:8是取8位hash
        path: path.resolve(__dirname, './build/') // 打包后的文件路径， 必须是绝对路径
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // 指定index.html模板位置
            filename: 'index.html'  ,       // 指定打包后文件名
            minify: {
                removeAttributeQuotes: true, // 去掉html中的可以去掉的属性中双引号
                collapseWhitespace: true    // 去掉空格变成一行
            },
            hash: true    // 引入静态资源时加入时间戳防止缓存
        }),
        new MiniCssExtractPlugin({
            filename: 'main.css' // 抽离出来的css文件名，可引入多个mini-css-extract-plugin进行灵活配置
        })
    ],
    module: { // 模块
        rules: [ // 规则 css-loader 接续 @import这种语法
            // style-loader 把css插到head标签中
            // loader的特点 希望单一
            // loader的用法 字符串 只用一个loader
            // 多个loader 需要使用[]
            // loader的顺序是默认从右向左执行 从下到上执行
            // loader可以写成对象方式，传入options
            {
                test: /\.css$/,
                use: [
                    // {
                    //     loader: 'style-loader',
                    //     options: {
                    //         insert: function insertAtTop(element) {
                    //             var parent = document.querySelector('head');
                    //             // eslint-disable-next-line no-underscore-dangle
                    //             var lastInsertedElement =
                    //               window._lastElementInsertedByStyleLoader;
                
                    //             if (!lastInsertedElement) {
                    //               parent.insertBefore(element, parent.firstChild);
                    //             } else if (lastInsertedElement.nextSibling) {
                    //               parent.insertBefore(element, lastInsertedElement.nextSibling);
                    //             } else {
                    //               parent.appendChild(element);
                    //             }
                
                    //             // eslint-disable-next-line no-underscore-dangle
                    //             window._lastElementInsertedByStyleLoader = element;
                    //           },
                    //     }
                    // },
                    // {
                    //     loader: 'css-loader',
                    //     options: {
                    //         import: true
                    //     }
                    // }
                    MiniCssExtractPlugin.loader, // 抽取css文件的loader，不再插入head里
                    "css-loader",
                    "postcss-loader"
                ]
            }
        ]
    }
}
// /************4 - end *****************************/


// /************5 - start *****************************/
// module.exports = {

//     optimization: {
//         minimize: true,
//         minimizer: [
//             new UglifyJsPlugin({
//                 cache: false,
//                 sourceMap:true,
//                 parallel:true
//             }),
//             new OptimizeCss(),
//         ]
//     },
//     mode: 'production', // 模式 默认两种 production（压缩） development（不压缩）
//     entry: './src/index.js', // 入口
//     output: {
//         filename: 'bundle.[hash:8].js', // 打包后文件名，加入hash防止文件缓存,即每次修改文件后都会产生一个新的文件,:8是取8位hash
//         path: path.resolve(__dirname, './build/') // 打包后的文件路径， 必须是绝对路径
//     },
//     plugins: [
//         new HtmlWebpackPlugin({
//             template: './src/index.html', // 指定index.html模板位置
//             filename: 'index.html'  ,       // 指定打包后文件名
//             minify: {
//                 removeAttributeQuotes: true, // 去掉html中的可以去掉的属性中双引号
//                 collapseWhitespace: true    // 去掉空格变成一行
//             },
//             hash: true    // 引入静态资源时加入时间戳防止缓存
//         }),
//         new MiniCssExtractPlugin({
//             filename: 'main.css' // 抽离出来的css文件名，可引入多个mini-css-extract-plugin进行灵活配置
//         })
//     ],
//     module: { // 模块
//         rules: [ // 规则 css-loader 接续 @import这种语法
//             // style-loader 把css插到head标签中
//             // loader的特点 希望单一
//             // loader的用法 字符串 只用一个loader
//             // 多个loader 需要使用[]
//             // loader的顺序是默认从右向左执行 从下到上执行
//             // loader可以写成对象方式，传入options
//             {
//                 test: /\.css$/,
//                 use: [
//                     // {
//                     //     loader: 'style-loader',
//                     //     options: {
//                     //         insert: function insertAtTop(element) {
//                     //             var parent = document.querySelector('head');
//                     //             // eslint-disable-next-line no-underscore-dangle
//                     //             var lastInsertedElement =
//                     //               window._lastElementInsertedByStyleLoader;
                
//                     //             if (!lastInsertedElement) {
//                     //               parent.insertBefore(element, parent.firstChild);
//                     //             } else if (lastInsertedElement.nextSibling) {
//                     //               parent.insertBefore(element, lastInsertedElement.nextSibling);
//                     //             } else {
//                     //               parent.appendChild(element);
//                     //             }
                
//                     //             // eslint-disable-next-line no-underscore-dangle
//                     //             window._lastElementInsertedByStyleLoader = element;
//                     //           },
//                     //     }
//                     // },
//                     // {
//                     //     loader: 'css-loader',
//                     //     options: {
//                     //         import: true
//                     //     }
//                     // }
//                     MiniCssExtractPlugin.loader, // 抽取css文件的loader，不再插入head里
//                     "css-loader",
//                     "postcss-loader"
//                 ]
//             }
//         ]
//     }
// }
// /************5 - end *****************************/

// /************6 - start *****************************/
// module.exports = {

    
//     mode: 'development', // 模式 默认两种 production（压缩） development（不压缩）
//     entry: './src/index.js', // 入口
//     output: {
//         filename: 'bundle.js', // 打包后文件名，加入hash防止文件缓存,即每次修改文件后都会产生一个新的文件,:8是取8位hash
//         path: path.resolve(__dirname, './build/') // 打包后的文件路径， 必须是绝对路径
//     },
//     plugins: [
//         new HtmlWebpackPlugin({
//             template: './src/index.html', // 指定index.html模板位置
//             filename: 'index.html'  ,       // 指定打包后文件名
//             minify: {
//                 removeAttributeQuotes: true, // 去掉html中的可以去掉的属性中双引号
//                 collapseWhitespace: true    // 去掉空格变成一行
//             },
//             hash: true    // 引入静态资源时加入时间戳防止缓存
//         }),
//         new MiniCssExtractPlugin({
//             filename: 'main.css' // 抽离出来的css文件名，可引入多个mini-css-extract-plugin进行灵活配置
//         })
//     ],
//     module: { // 模块
//         rules: [ // 规则 css-loader 接续 @import这种语法
//             // style-loader 把css插到head标签中
//             // loader的特点 希望单一
//             // loader的用法 字符串 只用一个loader
//             // 多个loader 需要使用[]
//             // loader的顺序是默认从右向左执行 从下到上执行
//             // loader可以写成对象方式，传入options
//             {
//                 test:/\.js$/,
//                 use: {
//                     loader: 'babel-loader', // es6 -> es5
//                     options: {
//                         presets: [
//                             '@babel/preset-env'
//                         ],
//                         plugins: [
//                             ["@babel/plugin-proposal-decorators", { "legacy": true }], // 解析装饰器
//                             ["@babel/plugin-proposal-class-properties", { "loose" : true }], // 解析类class
//                             "@babel/plugin-transform-runtime", // 将es6的一些新特性变成特定api，需要生产安装@babel/runtime，生产api的腻子脚本，注意不包含实例的新语法，如'aa'.includes('a'),需要额外生产安装@babel/profill，使用时引入
//                         ],
//                     }
//                 },
//                 include: path.resolve(__dirname, './src'), // 指定文件目录使用加载器
//                 exclude: /node_modules/ // 排除不需要处理的文件目录
//             },
//             {
//                 test: /\.css$/,
//                 use: [
//                     MiniCssExtractPlugin.loader, // 抽取css文件的loader，不再插入head里
//                     "css-loader",
//                     "postcss-loader"
//                 ]
//             }
//         ]
//     },
//     optimization: {
//         minimize: false,
//         minimizer: [
//             new UglifyJsPlugin({
//                 cache: false,
//                 sourceMap:true,
//                 parallel:true
//             }),
//             new OptimizeCss(),
//         ]
//     },
// }
// /************6 - end *****************************/

// /************7 ，8，9- start *****************************/
// var webpack = require('webpack');
// module.exports = {
//     mode: 'development', // 模式 默认两种 production（压缩） development（不压缩）
//     entry: './src/index.js', // 入口
//     output: {
//         filename: 'bundle.js', // 打包后文件名，加入hash防止文件缓存,即每次修改文件后都会产生一个新的文件,:8是取8位hash
//         path: path.resolve(__dirname, './build/') // 打包后的文件路径， 必须是绝对路径
//     },
//     plugins: [
//         new HtmlWebpackPlugin({
//             template: './src/index.html', // 指定index.html模板位置
//             filename: 'index.html'  ,       // 指定打包后文件名
//             minify: {
//                 removeAttributeQuotes: true, // 去掉html中的可以去掉的属性中双引号
//                 collapseWhitespace: true    // 去掉空格变成一行
//             },
//             hash: true    // 引入静态资源时加入时间戳防止缓存
//         }),
//         new MiniCssExtractPlugin({
//             filename: 'main.css' // 抽离出来的css文件名，可引入多个mini-css-extract-plugin进行灵活配置
//         }),
//         // 将jquery用$的形式暴露给每个模块且不用引入,但并不是挂到window上
//         // new webpack.ProvidePlugin({
//         //     $:'jquery'
//         // })
//     ],
//     externals: { // 使用外部资源，不要在模块中引入jquery，否则会对其进行打包
//         jqeury: '$'
//     },
//     module: { // 模块
//         rules: [ // 规则 css-loader 接续 @import这种语法
//             // style-loader 把css插到head标签中
//             // loader的特点 希望单一
//             // loader的用法 字符串 只用一个loader
//             // 多个loader 需要使用[]
//             // loader的顺序是默认从右向左执行 从下到上执行
//             // loader可以写成对象方式，传入options
//             // {
//             //     test: /\.js$/,
//             //     use: {
//             //         loader: "eslint-loader",
//             //         options: {
//             //             enforce: 'pre'  // 强制放到其他匹配的loader之前执行
//             //         }
//             //     }
//             // },
//             // 内联loader webpack配置写法
//             // {
//             //     test: require.resolve('jquery'),
//             //     use: 'expose-loader?$'
//             // },
//             {
//                 test:/.html$/,
//                 use: 'html-withimg-loader'
//             },
//             {
//                 test:/.(jpg|png|gif)$/,
//                 use: {
//                     loader:'url-loader',
//                     options: {
//                         limit: 1024*5, // 5k
//                         outputPath:'img/'
//                     }
//                 }
//             },
//             {
//                 test:/\.js$/,
//                 use: {
//                     loader: 'babel-loader', // es6 -> es5
//                     options: {
//                         presets: [
//                             '@babel/preset-env'
//                         ],
//                         plugins: [
//                             ["@babel/plugin-proposal-decorators", { "legacy": true }], // 解析装饰器
//                             ["@babel/plugin-proposal-class-properties", { "loose" : true }], // 解析类class
//                             "@babel/plugin-transform-runtime", // 将es6的一些新特性变成特定api，需要生产安装@babel/runtime，生产api的腻子脚本，注意不包含实例的新语法，如'aa'.includes('a'),需要额外生产安装@babel/profill，使用时引入
//                         ],
//                     }
//                 },
//                 include: path.resolve(__dirname, './src'), // 指定文件目录使用加载器
//                 exclude: /node_modules/ // 排除不需要处理的文件目录
//             },
//             {
//                 test: /\.css$/,
//                 use: [
//                     MiniCssExtractPlugin.loader, // 抽取css文件的loader，不再插入head里
//                     "css-loader",
//                     "postcss-loader"
//                 ]
//             }
//         ]
//     },
//     optimization: {
//         minimize: false,
//         minimizer: [
//             new UglifyJsPlugin({
//                 cache: false,
//                 sourceMap:true,
//                 parallel:true
//             }),
//             new OptimizeCss(),
//         ]
//     },
// }
// /************7，8，9 - end *****************************/


/************12，13 -打包多页应用和sorceMap- start *****************************/
var webpack = require('webpack');
module.exports = {
    devtool: 'source-map',
    mode: 'development', // 模式 默认两种 production（压缩） development（不压缩）
    // entry: './src/index.js', // 入口
    entry: {
        index: './src/index.js',
        other: './src/8.js',
    },
    output: {
        // filename: 'bundle.js', // 打包后文件名，加入hash防止文件缓存,即每次修改文件后都会产生一个新的文件,:8是取8位hash
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, './build/') // 打包后的文件路径， 必须是绝对路径
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // 指定index.html模板位置
            filename: 'index.html'  ,       // 指定打包后文件名
            minify: {
                removeAttributeQuotes: true, // 去掉html中的可以去掉的属性中双引号
                collapseWhitespace: true    // 去掉空格变成一行
            },
            hash: true,    // 引入静态资源时加入时间戳防止缓存
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html', // 指定index.html模板位置
            filename: 'other.html'  ,       // 指定打包后文件名
            minify: {
                removeAttributeQuotes: true, // 去掉html中的可以去掉的属性中双引号
                collapseWhitespace: true    // 去掉空格变成一行
            },
            hash: true,    // 引入静态资源时加入时间戳防止缓存
            chunks: ['other']
        }),
        new MiniCssExtractPlugin({
            filename: 'main.css' // 抽离出来的css文件名，可引入多个mini-css-extract-plugin进行灵活配置
        }),
        // 将jquery用$的形式暴露给每个模块且不用引入,但并不是挂到window上
        // new webpack.ProvidePlugin({
        //     $:'jquery'
        // })
    ],
    externals: { // 使用外部资源，不要在模块中引入jquery，否则会对其进行打包
        jqeury: '$'
    },
    module: { // 模块
        rules: [ // 规则 css-loader 接续 @import这种语法
            // style-loader 把css插到head标签中
            // loader的特点 希望单一
            // loader的用法 字符串 只用一个loader
            // 多个loader 需要使用[]
            // loader的顺序是默认从右向左执行 从下到上执行
            // loader可以写成对象方式，传入options
            // {
            //     test: /\.js$/,
            //     use: {
            //         loader: "eslint-loader",
            //         options: {
            //             enforce: 'pre'  // 强制放到其他匹配的loader之前执行
            //         }
            //     }
            // },
            // 内联loader webpack配置写法
            // {
            //     test: require.resolve('jquery'),
            //     use: 'expose-loader?$'
            // },
            {
                test:/.html$/,
                use: 'html-withimg-loader'
            },
            {
                test:/.(jpg|png|gif)$/,
                use: {
                    loader:'url-loader',
                    options: {
                        limit: 1024*5, // 5k
                        outputPath:'img/'
                    }
                }
            },
            {
                test:/\.js$/,
                use: {
                    loader: 'babel-loader', // es6 -> es5
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-decorators", { "legacy": true }], // 解析装饰器
                            ["@babel/plugin-proposal-class-properties", { "loose" : true }], // 解析类class
                            "@babel/plugin-transform-runtime", // 将es6的一些新特性变成特定api，需要生产安装@babel/runtime，生产api的腻子脚本，注意不包含实例的新语法，如'aa'.includes('a'),需要额外生产安装@babel/profill，使用时引入
                        ],
                    }
                },
                include: path.resolve(__dirname, './src'), // 指定文件目录使用加载器
                exclude: /node_modules/ // 排除不需要处理的文件目录
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader, // 抽取css文件的loader，不再插入head里
                    "css-loader",
                    "postcss-loader"
                ]
            }
        ]
    },
    optimization: {
        minimize: false,
        minimizer: [
            new UglifyJsPlugin({
                cache: false,
                sourceMap:true,
                parallel:true
            }),
            new OptimizeCss(),
        ]
    },
}
/************12 ，13- end *****************************/