## Vue/ node（npm）配置vue时出现 vue不是内部或外部命令

* 解决方法

网上有很多资料，主要是环境Path问题，但有时需要重启电脑。  
不用重启的方法：用Everything这个软件搜索vue.cmd的位置，搜索到这个批处理文件后把这个文件的路径加入环境变量Path中  
重新启动cmd执行 vue -V 看到说明就是成功了

## Vue/ 列表页，如果删除了该列表最后一页的唯一项后，更新列表页获取列表页有误

例如：当前列表页总共有3页，最后一页即第三页只有唯一一个数据，删除该数据后，应更新列表页，获取得到2页，但由于当前页码没改变，所以还是传递第3页的参数给后端，所以后端会返回无法获取到第三页。

* 解决方法  

```js
this.apiDelete().then(res => {
    this.pageLoading = false;
    if(res.code == 200){
        this.$Message.success('删除成功!');
        // 判断是否为最后一页的唯一项被删除
        if(this.page.pageNo > 1 && this.listData.length <= 1){
            this.page.pageNo--;
            this.page.pageCount--;
        }
        // 更新列表
        this.updateList();
        // 清空选项列表
        this.clearSelect();
    }
    else console.log(res);
}).catch(err => this.$Message.error('删除失败！'))
```

删除最后一项后，传递上一页的参数给后端，重新获取数据

## Vue/ 新版vue本地只能通过localhost访问项目，无法通过IP地址访问

* 解决方法  

在conifg文件夹下找到index.js，将 host: 'localhost' 改成 host: '0.0.0.0' ，重新run dev即可

## Vue/ 项目build后资源文件报错404的解决方案

当vue项目build后，我们会看到css、js报错404的问题，然后，查看index.html，看到下面的代码：　

```js
    <script type=text/javascript src=/static/js/app.41ce5f66426864089c57.js></script>
```

* 解决方法  

到config文件夹下的index.js文件，找到build.assetsPublicPath，将"/"修改成"./"：  

```js
    build: {
        // Template for index.html
        index: path.resolve(__dirname, '../dist/index.html'),

        // Paths
        assetsRoot: path.resolve(__dirname, '../dist'),
        assetsSubDirectory: 'static',
        assetsPublicPath: './'
    ｝
```

## Vue/ 单页应用，某一个页面绑定scroll事件问题

某一个页面绑定scroll事件后，导致其他页面也会触发scroll事件，如果存在接口请求，会导致请求很多次。

* 解决方案：

```js
mounted(){
    // 监听滚动事件
    window.addEventListener('scroll', this.scrollPage);
}
```

在该页面组件周期函数内，销毁对应事件：
```js
destroyed(){
    // 移除滚动事件
    window.removeEventListener("scroll",this.scrollPage);
}
```

## Vue/ 单页应用&移动端，页面共用滚动问题
用Vue开发移动端单页应用时，发现在A页面滚动到X位置，这是跳转到B页面，如果B页面内容够长，B页面也停留到X位置，这是不正常的。

* 解决方案：

使用全局路由钩子函数，路由刷新时让窗口滚到顶部

```js
router.beforeEach((to, from, next) => {	
	// A跳转到B，B页面停留在A页面的滚动位置；解决方法：将scrollTop设置为0
	window.scroll(0, 0);
	next();
});
```

## Vue/ 单页应用&移动端，列表页无限加载，从列表页跳转内容页，再次返回列表页时回到原来位置

如题，在用Vue开发移动端单页应用时，列表页A实现的效果时滚动到底部无限加载数据，从列表页A跳转内容页B，再从B返回A时，希望能保留原来A的当前位置不变。

借鉴了网上很多种方法，多数是使用缓存记录A的位置scrollH，然后从B返回A时直接设置scrollTo(0, scrollH)到原来位置。

但是这个方法对我并不管用，这样会使winndw绑定的scorll事件触发，请求数据，然后由于各种原因无法让A回到原来的位置。（什么原因不细讲了，具体分析原理可以看这篇文章：https://www.cnblogs.com/minigrasshopper/p/8011748.html，它解释的比较详细）

* 解决方案：

```HTML
<!-- 资讯列表 -->
<ul class="news_list">
    <li v-for="(item, index) in newsList" :key="index" class="news_li_item proj_news" @click="gotoDetail(item.id)">
    <!-- 这里是某个列表内容 -->
    </li>
</ul>
```

```JS
data() {
    return{
        // 资讯列表
        newsList: [],
        // 是否显示返回顶部按钮
        showTopBtn: false,
        // 显示新闻数量
        listNum: 10,
        // 用来监听是否在加载，如果正在加载不再多请求接口
        loadMoreNow: false,
        // 列表滚动高度
        listScrollH: 0,
    }
},
created(){
    // 从缓存获取列表数量
    let getListNum = GetCookie('listNum');
    if(getListNum) this.listNum = parseInt(getListNum);

    this.getListData(this.listNum, false);

    // 从缓存获取列表滚动高度
    let getScrollH = GetCookie('scrollH');
    if(getScrollH) this.listScrollH = parseInt(getScrollH);
},
mounted(){
    // 监听滚动事件
    window.addEventListener('scroll', this.scrollPage);
},
method:{
    // 获取列表内容， num: 请求数量，more：是否加载更多
    getListData(num, more){
        // 请求接口
        Api.DeclareList({
            pageNum: 1,
            pageSize: num
        })
        .then(res => {
            if(res.code == 200){
                this.newsList = res.data.result;
                // 是否加载更多
                if(more){
                    // 请求数量大于返回的数据总量，再无数据可添加
                    if(this.listNum >= res.data.dataCount) this.loadMoreNow = true;
                    else this.loadMoreNow = false;
                }
                // 第一次页面加载
                else{
                    // 获取到缓存滚动高度
                    if(this.listScrollH > 0){
                        var _this = this;
                        this.$nextTick(() => {
                            scrollTo(0, _this.listScrollH);	
                        })
                    }
                }
            }
            // 提示信息弹窗
            else this.showWarnModel(res.msg, 'warning');
        })
        .catch(err => console.log(err))
    },
    // 页面滚动
    scrollPage(){
        let	scrollTop = $(window).scrollTop();

        // 缓存有滚动高度，未到该高度不触发后面的操作
        if(this.listScrollH > 0 && scrollTop <= this.listScrollH) return false;

        let windowH = $(window).height(),
            documentH = $(document).height();

        // 滚动到一定高度的时候开始加载
        if(scrollTop + windowH > documentH - 40){
            if(!this.loadMoreNow) {
                // 正在加载
                this.loadMoreNow = true;
                // 累加5条记录
                this.listNum += 5;
                // 列表数量存缓存
                SetCookie('listNum', this.listNum);
                // 获取更多内容
                this.getListData(this.listNum, true);
            }
        }
    }
},
// 导航离开该组件的对应路由时调用
beforeRouteLeave (to, from, next) {
    // 进入资讯详情页
    if(to.name === 'NewsDetail') next();
    else{
        // 清除列表数量和滚动高度缓存
        DelCookie('listNum');
        DelCookie('scrollH');
        next();
    }
}
```