# yarn 常用命令

可通过以下述命令安装 yarn

``` bash
npm install -g yarn
```

| Command | Description |
| :----- | :--------- |
|yarn search \<keyword\>|列出带有关键字的包的列表|
|yarn ls | 列出安装包的列表
|yarn config list| 列出配置项
|yarn config set \<key\> \<value\>|设置配置项的值
|yarn config get \<key\>| 获取配置项值
|yarn config delete \<key\>| 删除配置项的值
|yarn config set registry <https://registry.yarn.taobao.org>| 设置下载源为淘宝
|yarn init|创建 package.json 文件
|yarn install| 安装 package.json 中所有依赖
|yarn add \[\<pkg\>...\]| 安装生产依赖
|yarn add \[\<pkg\>...\] -D| 安装开发依赖
|yarn add \[\<pkg\>...\] -O| 安装可选依赖
|yarn add \[\<pkg\>...\] -E| 安装确切的依赖
|yarn upgrade \[\<pkg\>...\]| 更新 package.json 中的包
|yarn remove \[\<pkg\>...\] \[-g\|-D\|-P\|-O\]| 移除包
|yarn global add \[\<pkg\>...\]| 全局安装
|yarn global upgrade \[\<pkg\>...\]| 更新全局安装的包
|yarn global remove \[\<pkg\>...\]| 移除全局安装的包
|yarn global bin| 查看当前yarn的bin的位置
|yarn global dir| 查看当前yarn的bin的位置
|         |

**补充：改变 yarn 的全局安装路径和缓存路径**  
在某个目录下建立 yarn_global、yarn_cache 文件夹，这里以 D:\yarn
为例:

```shell
# 设置全局安装目录
yarn config set global-folder D:\\yarn\\yarn_global 
# 设置全局安装包的脚本bin的目录，该目录下会生成一个bin，里面是脚本命令
yarn config set prefix D:\\yarn\\yarn_global  
# 设置全局安装缓存目录
yarn config set cache-folder  D:\\yarn\\yarn_cache  
```

由于 nodejs 存在这样一个模块加载机制：它总是在 node_modules 目录下找依赖包，并且是从当前目录往上层目录找，直到系统根目录。如果根目录中也没有对应的包，则去系统环境变量中 NODE_PATH 对应的目录去找。  

所以如果想要在任何地方使用 require 引入全局安装的包，则需配置系统环境变量 NODE_PATH = yarn 配置文件中的 prefix 对应的值\node_modules（windwos 下可以使用 echo \%NODE_PATH\% 去验证一下，nodejs 进程执行的时候，它可以从 process.env.NODE_PATH 中获取该值，如果NODE_PATH已经有 npm 的配置，则继续追加即可）。  

最后，如果想要可以在任何地方直接执行全局安装包的命令，需要将 D:\yarn\yarn_global\bin 或 D:\yarn\yarn_global\node_modules\\.bin 配置到系统环境变量 Path 中去。  
**总之 yarn 和 npm 区别不大**
