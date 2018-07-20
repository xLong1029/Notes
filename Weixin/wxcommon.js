///////////////// 暴露的接口 start //////////////

// 获取微信认证信息 旧版，请使用 wxcommon.getWeixinUserinfo()
function getWeixinUserinfo() {
    return xtyCookie.get('weixin_oauthuserinfo');
}
var wxcommon = {
    // 获取微信认证信息
    getWeixinUserinfo: function () {
        return xtyCookie.get('weixin_oauthuserinfo');
    },
    // 需要使用的JS接口列表定义
    jsSdkApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage'
    ],
    // 加载微信 JSSDK 签名
    jsSdkSignatureReady: function (callback, extra) {
        var data = xtyCookie.get('weixin_JsSdkUiPackage');
        if (data) {
            wx.config({
                debug: false,
                appId: data.AppId,
                timestamp: data.Timestamp,
                nonceStr: data.NonceStr,
                signature: data.Signature,
                jsApiList: wxcommon.jsSdkApiList
            });
            wx.error(function (res) {
                // alert(res);
            });
            wx.ready(function () {
                callback(data, extra);
            });
        }
    }
}
///////////////// 暴露的接口 end //////////////

///////////////// 底层逻辑处理 start //////////////
// cookie 的存储与读取
var xtyCookie = {
    get: function (n) {
        var re = new RegExp(n + '=([^;]*);?', 'gi');
        var r = re.exec(document.cookie) || [];
        var data = r.length > 1 ? r[1] : null;
        if (data != null) {
            return JSON.parse(decodeURIComponent(data));
        }
        return false;
    },
    set: function (n, v, e, p, d, s) {
        var t = new Date;
        if (e) {
            t.setTime(t.getTime() + (e * 8.64e7));
        }
        document.cookie = n + '=' + encodeURIComponent(JSON.stringify(v)) + '; ' + (!e ? '' : '; expires=' + t.toGMTString()) + (!p ? '' : '; path=' + p) + (!d ? '' : '; domain=' + d) + (!s ? '' : '; secure')
    },
    remove: function (n, p, d) {
        var t = xtyCookie.get(n);
        document.cookie = n + '=' + (!p ? '' : '; path=' + p) + (!d ? '' : '; domain=' + d) + '; expires=Thu, 01-Jan-70 00:00:01 GMT';
        return t
    }
};

function main() {
    if (!xtyCookie.get('oauth2_wxcommonjs_run_count') || xtyCookie.get('oauth2_wxcommonjs_run_count') == 0) {
        var userinfo = xtyCookie.get('weixin_oauthuserinfo');
        if (!userinfo) {
            xtyCookie.set('oauth2_wxcommonjs_run_count', 1);
            window.location = '/OAuth2/WXCommonJS?returnUrl=' + encodeURI(window.location.href);
        }
        xtyCookie.set('oauth2_wxcommonjs_run_count', 0);
    }
}

main();
///////////////// 底层逻辑处理 end //////////////