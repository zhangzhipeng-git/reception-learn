# npm 常用命令

| Command | Description |
| :----- | :--------- |
|npm search \<keyword\>|列出带有关键字的包的列表|
|npm ls | 列出安装包的列表
|npm config list| 列出配置项
|npm config set \<key\> \<value\>|设置配置项的值
|npm config get \<key\>| 获取配置项值
|npm config delete \<key\>| 删除配置项的值
|npm config edit|用记事本而打开.npmrc文件，包含所有配置项
|npm config set registry <https://registry.npm.taobao.org>| 设置下载源为淘宝
|npm init|创建 package.json 文件
|npm install| 安装 package.json 中所有依赖
|npm install \[\<pkg\>...\]| 安装生产依赖
|npm install \[\<pkg\>...\] -P| 安装生产依赖
|npm install \[\<pkg\>...\] -D| 安装开发依赖
|npm install \[\<pkg\>...\] -O| 安装可选依赖
|npm install \[\<pkg\>...\] -E| 安装确切的依赖
|npm install \[\<pkg\>...\] -g| 全局安装
|npm update \[-g\] \[\<pkg\>...\]| 更新包
|npm uninstall \[\<pkg\>...\] \[-g\|-D\|-P\|-O\]| 移除包
|         |

**补充：改变 npm 的全局安装路径和缓存路径**  
在某个目录下建立 npm_global、npm_cache 文件夹，这里以 D:\npm
为例：  
其中 prefix 表示 npm 全局安装目录的 bin ，存放了全局安装包的脚本命令，初次全局安装包的时候，它会在里面生成一个 node_modules 目录，然后往里面放包，而 cache 则对应下载包的缓存根目录

```bash
npm config set prefix D:\npm\node_global  
npm config set cache  D:\npm\node_cache
```

由于 nodejs 存在这样一个模块加载机制：它总是在 node_modules 目录下找依赖包，并且是从当前目录往上层目录找，直到系统根目录。如果根目录中也没有对应的包，则去系统环境变量中 NODE_PATH 对应的目录去找。  

所以如果想要在任何地方使用 require 引入全局安装的包，则需配置系统环境变量 NODE_PATH = npm 配置文件中的 prefix 对应的值\node_modules（windwos 下可以使用 echo \%NODE_PATH\% 去验证一下，nodejs 进程执行的时候，它可以从 process.env.NODE_PATH 中获取该值）。  

最后，如果想要可以在任何地方直接执行全局安装包的命令，需要将 D:\npm\node_global 或 D:\npm\node_global\node_modules\\.bin 配置到系统环境变量 Path 中去。
