## Less&Rem/ 开发移动端项目时，px转rem单位，使用方法

* CSS3中的rem相对单位

rem是CSS3新增的一个相对单位，使用rem为元素设定的是相对大小，且相对的只是HTML根元素。rem单位在开发移动端页面时很方便，可以根据不同屏幕大小来调整内容大小。  
  
浏览器默认大小为16px，所以我们可以把设置根元素相对字体大小：  

<pre>
 html{
   font-size: 62.5%; -> 1rem   // 相当于font-size:10px，写font-size:10px也是一样的
}
</pre>

因为16px*0.625=10px，这样得到相对根元素的换算 1rem = 10px  
  
样式使用例：

<pre>
 .xxx{
   font-size:1.2rem;  // 相当于 font-size:12px
   width:1.5rem;      // 相当于 width:15px
}
</pre>

这样有个问题，如果要设置12px转换成rem就是1.2rem，开发时需要自己换算添加小数点，为了方便，我会把根元素相对字体大小*10，即：  

<pre>
 html{
   font-size: 625%; -> 10rem   // 相当于font-size:10px
} 
</pre>

这样得到相对根元素的换算 10rem = 10px  

那么上面的例子就更新为：  

<pre>
 .xxx{
   font-size:12rem;  // 相当于 font-size:12px
   width:15rem;      // 相当于 width:15px
}
</pre>

*并不是所有浏览器最小文字大小都为10px，例如：谷歌浏览器最小文字大小为12px，即使设置font-size:10rem，换算始终得到的是12px，所以字体最小大小最好设置为12rem，以免引起不必要的麻烦

* 移动端开发中如何使用rem

那么重点来了，我们以上设置的相对单位，如何在不同手机屏幕下真正做到自适应缩放大小？  

思考一下，因为我们的根元素的相对字体大小一直是font-size: 625% (font-size: 10px);
我当前是用iPhone5（320*568px）开发模式时，我设置的font-size:14rem得到的是14px，当我改用iPhone6Plus（414*736px）开发模式时，它还是14px，但是iPhone6Plus的显示尺寸明显比iPhone5的大，为了能够自适应缩放，我们应该根据显示尺寸来改变根元素的相对字体大小。

网上有很多设置方法，常见的是每个屏幕尺寸都设置一次如下：

<pre>
 @media screen and (min-width:320px){ html{ font-size:12px; } }  
 @media screen and (min-width:346px){ html{ font-size:13px; } }  
 @media screen and (min-width:352px){ html{ font-size:14px; } }  
 @media screen and (min-width:400px){ html{ font-size:15px; } }  
 @media screen and (min-width:480px){ html{ font-size:18px; } }  
 @media screen and (min-width:560px){ html{ font-size:21px; } }  
 @media screen and (min-width:640px){ html{ font-size:24px; } }  
</pre>

但我个人觉得没必要设置这么多，应该根据具体需求来设置，所以我设置的就比较少，而且也比较随意，主要看页面显示效果是否可观即可。  
我的设置方法，以iPhone6的375px为基准，比它大的来计算：

<pre>
 @media screen and (min-width: 414px) {  
     html {  
         font-size: 690%;     // 414/375*625% = 690%  
     }  
 }  
  
 @media screen and (min-width: 480px) {  
     html {  
         font-size: 800%;    // 480/375*625%  
     }  
 }  

 @media screen and (min-width: 640px) {  
     html {  
         font-size: 938%;    // 1.5*625%，这里使用1.5倍是因为1.5倍对于我的设计页面是刚好合适的大小  
     }  
 }
</pre>

* 在Less中使用rem，节省计算时间

平时切图得到的是设计图片大小，但实际开发时需要设置成等比大小。  
例如我们得到的640px宽的设计稿切下来的一个图标大小为64*64px，css里设置图标的高宽换算成设计稿中的1/2（至少是1/2，如果设计稿分辨率很大，也可能会换算成1/3，这里涉及到移动设备的逻辑分辨率和物理分辨率问题，可自行查阅资料），即：  

<pre>
 .icon{  
    width:32px;  
    height:32px;  
 }
</pre>

这样有个问题，就是每次我们切图写css都需要进行一半的换算，这时候我们可以使用less或者sass来减少这部分的工作量，我原来是用sass，现在尝试用less，不太了解的建议看一下官方文档。  

设置如下：

<pre>
 @root_ft_size : 100;   // 根字体大小(单位px)  
 @rem: 1rem/ @root_ft_size;  // 单位px转换rem  
 @half_rem: 0.5rem/ @root_ft_size;    // 单位px转换1/2rem
</pre>

那么上面的例子则可以写为：

<pre>
 .icon{  
    width:64*half_rem;  
    height:64*half_rem;  
 }
</pre>

这样，我们就不用再进行换算，切图是多大就写多大就好啦。