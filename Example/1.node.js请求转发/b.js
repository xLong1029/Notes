/*
功能：nodeJS转发请求实现跨域访问，服务端B
时间：2018-8-29
*/

var express = require('express');
var request = require('request');
var app = express();


app.use(function (req, res) {
    var url = 'http://localhost:8091' + req.url;
    console.log(url, req.url);
    request({
        url: url,
        methods: 'GET',
        json: true
    }, function(_err, _res, _resBody){
        res.json(_resBody);
    })
});

var server = app.listen(8092, () => {
    console.log(`Litened At 8092`);
});

// 访问 http://localhost:8092/a 获得 http://localhost:8091/a 的数据
// 访问 http://localhost:8092/b 获得 http://localhost:8091/b 的数据