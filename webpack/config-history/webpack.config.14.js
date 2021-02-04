var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin'); // 处理index.html文件
var MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离css
var OptimizeCss = require('optimize-css-assets-webpack-plugin'); // 压缩css，可设置选项
var UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // 压缩js，可设置选项

var webpack = require('webpack');
/************ 14 - start *********** */
module.exports = {
    devtool: 'source-map',
    mode: 'development', // 模式 默认两种 production（压缩） development（不压缩）
    // entry: './src/index.js', // 入口
    entry: {
        index: './src/index.js',
        other: './src/8.js',
    },
    watch: true,
    watchOptions: {
        poll: 1000, // 每秒问我一千次
        aggreatement: 500 , // 我一直输入代码 ，防抖
        ignored: /node_modules/ // 排除监视的文件
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
        rules: [
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

/************ 14 - end *********** */