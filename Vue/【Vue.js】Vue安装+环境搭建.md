# Vue环境搭建和安装
## 一、先安装 Nodejs
下载地址 http://nodejs.cn/， 在 Nodejs 根目录下建立 "node_global" 及 "node_cache" 两个文件夹

## 二、运行cmd命令提示符，查看node和npm版本
> node -v

> npm -v

## 三、配置 npm 全局模块和 cache 的存放路径
> npm config set prefix "C:\Program Files\nodejs\node_global"

> npm config set cache "C:\Program Files\nodejs\node_cache"

## 四、配置好环境变量
系统变量 NODE_PATH:C:\Program Files\nodejs  
用户变量 PATH:C:\Program Files\nodejs\node_global  

## 五、安装淘宝镜像（可选）
> npm install -g cnpm --registry=https://registry.npm.taobao.org  //安装淘宝镜像后npm 全部改成 cnpm 

## 六、安装vue
> npm install -g vue //全局安装

## 七、安装webpack
1. 全局安装 webpack ：
> npm install webpack -g

2. 确定已有package.json，没有就npm init 创建
> npm init

3. 查看 webpack 版本信息：
> npm info webpack

4. 如果要使用 webpack 开发工具，要单独安装 webpack-dev-server
> npm install webpack-dev-server --save-dev

## 八、安装vue脚手架
> npm install -g @vue/cli //全局安装

## 九、创建项目
> vue create project-name //项目名称不支持驼峰，需要连字符进行拼接单词

> ? Please pick a preset： //选择Manually select features

> ? Check the features needed for your project: 
```
 ◉ Babel
 ◯ TypeScript
 ◯ Progressive Web App (PWA) Support
 ◉ Router
 ◉ Vuex
 ◉ CSS Pre-processors
❯◉ Linter / Formatter
 ◯ Unit Testing
 ◯ E2E Testing
```

## 十、端口修改
项目根目录的 vue.config.js 文件夹（如果没有就自己创建）中配置：
```js
module.exports = {
  devServer: {
    port: 9090
  },
}
```

## 十一、启动项目
> cd project-name

> npm run serve

这时我们可以在浏览器中输入: http://localhost:9090/ 即可访问
