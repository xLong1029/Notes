## WebApp/ 移动端开发遇到的一些问题和解决方法

### 一、取消移动端浏览器自带样式

移动端系统浏览器会自带一些样式，比如输入框、按钮等会有默认样式，需要清除这些样式才能真正显示原有设计的css样式：

```css
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
```

### 二、点击A标签，会出现光标问题

在移动端即使使用 cursor: pointer; 点击A标签时会显示光标可以输入文字。

解决方法（以下以vue为实例）是给A标签添加点击事件：

```html
<a class="btn fr" @click="toSearch">
    <i class="icon-search"></i>
</a>

// 点击事件
toSearch(){
    gotoPage('Search', {}, this);
}

// gotoPage是我写的一个通用方法
gotoPage(routeName, params, _this){
    _this.$router.push({ name : routeName, query : params });
}
```

### 三、移动端访问设置

```js        
    function isMobile(){
        // 如果有HTTP_X_WAP_PROFILE则一定是移动设备
        if (isset ($_SERVER['HTTP_X_WAP_PROFILE']))
            return true;
    
        //此条摘自TPM智能切换模板引擎，适合TPM开发
        if(isset ($_SERVER['HTTP_CLIENT']) &&'PhoneClient'==$_SERVER['HTTP_CLIENT'])
            return true;
        //如果via信息含有wap则一定是移动设备,部分服务商会屏蔽该信息
        if (isset ($_SERVER['HTTP_VIA']))
            //找不到为flase,否则为true
            return stristr($_SERVER['HTTP_VIA'], 'wap') ? true : false;
        //判断手机发送的客户端标志,兼容性有待提高
        if (isset ($_SERVER['HTTP_USER_AGENT'])) {
            $clientkeywords = array(
                'nokia','sony','ericsson','mot','samsung','htc','sgh','lg','sharp','sie-','philips','panasonic','alcatel','lenovo','iphone','ipod','blackberry','meizu','android','netfront','symbian','ucweb','windowsce','palm','operamini','operamobi','openwave','nexusone','cldc','midp','wap','mobile'
            );
            //从HTTP_USER_AGENT中查找手机浏览器的关键字
            if (preg_match("/(" . implode('|', $clientkeywords) . ")/i", strtolower($_SERVER['HTTP_USER_AGENT']))) {
                return true;
            }
        }
        //协议法，因为有可能不准确，放到最后判断
        if (isset ($_SERVER['HTTP_ACCEPT'])) {
            // 如果只支持wml并且不支持html那一定是移动设备
            // 如果支持wml和html但是wml在html之前则是移动设备
            if ((strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') !== false) && (strpos($_SERVER['HTTP_ACCEPT'], 'text/html') === false || (strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') < strpos($_SERVER['HTTP_ACCEPT'], 'text/html')))) {
                return true;
            }
        }
        return false;
    }

    //移动设备浏览，则切换模板
    if (ismobile()) {
        //设置默认默认主题为 Mobile
        $app_path='Mobile/'.CONTROLLER_NAME.'/'.ACTION_NAME;
        redirect($app_path);
    }
```

### 四、iOS上同时使用 fixed 和 transition 进行变换时会出现空白
 
解决方法：transform元素内部不能有absolute、fixed元素，要分离开（这里不好贴代码展示，自行理解）。

### 五、Rem使用方法

详情查看 https://github.com/xLong1029/Notes/blob/master/WorkMark/Less.md

### 六、IconFont使用方法

详情查看 https://github.com/xLong1029/Notes/blob/master/WorkMark/Css.md