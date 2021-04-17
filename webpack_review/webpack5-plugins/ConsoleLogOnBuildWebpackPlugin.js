class ConsoleLogOnBuildWebpackPlugin {
    apply(compiler) { // webpack 编译器
        // run 钩子，webpack 开始启动
        compiler.hooks.run.tap( {name: 'xxx'}, (compilation) => {
            console.log(ConsoleLogOnBuildWebpackPlugin.name)
            console.log(compiler === compilation); // true
            console.log('The webpack build process is starting!!!');
        });
    }
}
module.exports = ConsoleLogOnBuildWebpackPlugin;