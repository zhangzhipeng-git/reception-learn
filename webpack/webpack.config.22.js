var path = require('path');
var webpack = require('webpack');
var Happypack = require('happypack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    devServer: {
        hot:true,
        contentBase: 'dist2'
    },
    mode:'development',
    entry: {
        index: './src/index.js'
    },
    output: {
        filename: '__dll__[name].js',
        path: path.resolve(__dirname,'./dist2'),
        library: '__dll__[name]', // 模块返回值
        // libraryTarget: 'var' // umd, commonjs, this, amd, var // 返回模式
    },
    plugins: [
        // new webpack.DllPlugin({
        //     path: path.resolve(__dirname, 'dist2', 'manifest.json'),
        //     name: '__dll__[name]', // 找到任务清单对应的打包文件
        // }),
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
        new webpack.NamedModulesPlugin(), // 打印更新的模块的路径
        new webpack.HotModuleReplacementPlugin() // 热更新插件
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
}