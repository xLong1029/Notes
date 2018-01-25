## Create-reat-app/ 用sass编译出来的样式有乱码前缀
例如：原样式 .container{...}，编译后为.xxx_container{...}，导致渲染时浏览器无法显示样式

* 解决方法

在node_modules/react-scripts/config下找到 webpack.config.dev.js 文件，在 exclude 中添加 /.scss$/,
{
    test: /\.scss$/,
    loaders: ["style-loader","css-loader?sourceMap","sass-loader?sourceMap"],
}
如果要在生产环境中生效，需要在webpack.config.prod.js做同样的配置。

## Create-reat-app/ 使用固定路径
遇到利用相对于根目录进行引用组件，路径多数是"../../../"不利于开发

* 解决方法

需要在webpack.config.dev.js里添加如下配置：
// 定义别名和插件位置，其中__dirname为项目主要根目录
'@': path.resolve('./src'),
'api': path.resolve('./src/api'),
'pages': path.resolve('./src/pages'),
'components': path.resolve('./src/components'),
'styles': path.resolve('./src/styles'),
'images': path.resolve('./src/images'),

修改后可直接写相对路径"@/xxx/xxx"即"src/xxx/xxx"

*在任何模块文件内部，可以使用__dirname变量获取当前模块文件所在目录的完整绝对路径。
*path.resolve（）方法将一系列路径或路径段解析为绝对路径。语法：path.resolve([from ...], to)，详细用法可看：http://javascript.ruanyifeng.com/nodejs/path.html

## Create-reat-app/ 使用Browser去掉Url中的“#”
* 解决方法
![Image text](images/react-route-browser-history.png)

*在react-router 4将Browser History改为BrowserRouter

## Vue/ 列表页，如果删除了该列表最后一页的唯一项后，更新列表页获取列表页有误
例如：当前列表页总共有3页，最后一页即第三页只有唯一一个数据，删除该数据后，应更新列表页，获取得到2页，但由于当前页码没改变，所以还是传递第3页的参数给后端，所以后端会返回无法获取到第三页。

* 解决方法

    // 判断是否为最后一页的唯一项被删除
    if(this.page.pageNo > 1 && this.listData.length <= 1){
        this.page.pageNo--;
        this.page.pageCount--;
    }
    删除最后一项后，传递上一页的参数给后端，重新获取数据