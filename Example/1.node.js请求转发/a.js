/*
功能：nodeJS转发请求实现跨域访问，服务端A
时间：2018-8-29
*/

var express = require('express');
var app = express();

app.get('/a', function (req, res) {
    res.send({'data': 'a'});
});

app.get('/b', function (req, res) {
    res.send({'data': 'b'});
});

app.listen(8091);