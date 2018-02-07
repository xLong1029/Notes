## WebApp/ 移动端开发遇到的一些问题和解决方法

* 取消移动端浏览器自带样式  
    
    移动端系统浏览器会自带一些样式，比如输入框、按钮等会有默认样式，需要清除这些样式才能真正显示原有设计的css样式：  
    <pre>
        * {
            // 取消移动端浏览器自带样式
            -webkit-appearance:none;

            //这一句是用来解决在安卓上的点击出现蓝色背景问题
            -webkit-tap-highlight-color:rgba(0,0,0,0);
        }

        // 下面是解决ios上去除微信点击蓝色背景
        a:focus, input:focus, p:focus, div:focus{
            -webkit-tap-highlight-color:rgba(0,0,0,0);
            -webkit-user-modify:read-write-plaintext-only; 
        }
    </pre>

* 点击A标签，会出现光标问题

    在移动端即使使用 cursor: pointer; 点击A标签时会显示光标可以输入文字。
    
    解决方法（以下以vue为实例）是给A标签添加点击事件：

    <pre>
        &lgt;a class="btn fr" @click="toSearch"&gt;
				&lgt;i class="icon-search"&gt;&lgt;/i&gt;
		&lgt;/a&gt;

        // 点击事件
        toSearch(){
            gotoPage('Search', {}, this);
        }

        // gotoPage是我写的一个通用方法
        gotoPage(routeName, params, _this){
            _this.$router.push({ name : routeName, query : params });
        }
    </pre>

* Rem使用方法

    详情查看 https://github.com/xLong1029/Notes/blob/master/WorkMark/Less.md

* iconFont使用方法

    详情查看 https://github.com/xLong1029/Notes/blob/master/WorkMark/Css.md