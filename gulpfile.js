/**
 * Created by bmqy on 2016/8/19.
 */
var oTestFlag = true; // 线上/线下环境开关。“true”为线下测试环境；“false”为线上发布环境

// 将文本转换成数组
var htmlCodes = [
    '新电改“放闸” 万亿市场呼之欲出',
    'http://zixun.ibicn.com/d1284326.html',
    '五粮液上调出厂价 中高端白酒掀涨价潮',
    'http://zixun.ibicn.com/d1284304.html',
    '消费级无人机孕育百亿蓝海',
    'http://zixun.ibicn.com/d1284474.html',
    '低温乳酸菌饮料“退烧” 低糖版是出路？',
    'http://zixun.ibicn.com/d1284494.html',
    '进口红酒压缩国产红酒生存空间',
    'http://zixun.ibicn.com/d1284468.html',
    '煤电联动上调电价可能性很小 火电企业将迎来倒闭潮',
    'http://zixun.ibicn.com/d1284424.html',
    '港口码头也能作为不动产 进行抵押了',
    'http://zixun.ibicn.com/d1284393.html',
    '新能源车现“政策市” 限购城市销量持续走高',
    'http://zixun.ibicn.com/d1284319.html',
    '2016年中国天然气行业发展现状分析及市场前景展望',
    'http://zixun.ibicn.com/d1284497.html'
];

var gulp = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var plumber = require('gulp-plumber');  // 阻止 gulp 插件发生错误时导致进程退出，并输出错误日志
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var http = require('http');
var BufferHelper = require('bufferhelper'); // 解决中文编码问题
var iconvLite = require('iconv-lite'); // 解决编码转换模块
var cheerio = require('cheerio'); // dom元素操作模块

// 将文本数组转换成json数据
var arrData = [];
for(var i=0; i<htmlCodes.length; i=i+2){
    var _temp2json = {};
    _temp2json.title = htmlCodes[i];
    _temp2json.href = htmlCodes[i+1];
    arrData.push(_temp2json);
}
var listTxtArr = arrData.slice(5,arrData.length);

// 为图片资源路径添加当天日期路径
var oDate = new Date();
var sYear = oDate.getFullYear();
var sMonth = oDate.getMonth() + 1;
sMonth = sMonth < 10 ? '0'+sMonth : sMonth;
var sDay = oDate.getDate();
sDay = sDay < 10 ? '0'+sDay : sDay;
var sDate = sYear +'/'+ sYear + sMonth + sDay; // 此路径对应ftp资源路径
// 生成发布版本目录名
var publishSrc = sMonth +'.'+ sDay;

// 按开发环境更换资源图片资源路径
var testResourcePath = '../image/';
var siteResourcePath = 'http://file.ibicn.com/edm/'+ sDate +'/';
var resourcePath = oTestFlag ? testResourcePath : siteResourcePath;

// 根据地址加载资讯页内容
function getContentFromHtml(url, callback) {
    var dataJson = {};
    http.get(url, function (res) {
        var bufferHelper = new BufferHelper();
        res.on('data', function (chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function () {
            var doc, $;
            var _tempContent = '';
            var val = iconvLite.decode(bufferHelper.toBuffer(), 'utf-8');
            doc = val.toString();
            $ = cheerio.load(doc);
            $('.body_left .text').find('p').each(function (i, e) {
                _tempContent = _tempContent + $(e).text();
            });
            _tempContent = _tempContent.replace(/\r*\n*\t*/gi, '');
            _tempContent = _tempContent.substring(0, 100) + '...';
            dataJson.title = $('.title').text();
            dataJson.content = _tempContent;
            return callback(null, dataJson);
        });
    }).on('error', function () {
        return dataJson = null;
    });
};
var _getList1s, _getList2s, _getList3s, _getList4s,
    list1 = {},
    list2 = {},
    list3 = {},
    list4 = {};
_getList1s = getContentFromHtml(arrData[1].href, function (err, result) {
    list1.title = result.title;
    list1.content = result.content;
});
_getList2s = getContentFromHtml(arrData[2].href, function (err, result) {
    list2.title = result.title;
    list2.content = result.content;
});
_getList3s = getContentFromHtml(arrData[3].href, function (err, result) {
    list3.title = result.title;
    list3.content = result.content;
});
_getList4s = getContentFromHtml(arrData[4].href, function (err, result) {
    list4.title = result.title;
    list4.content = result.content;
});

gulp.task('cleanHtml', function () {
    return gulp.src('dist/html', {read: false})
        .pipe(plumber())
        .pipe(clean());
});
gulp.task('cleanImage', function () {
    return gulp.src('dist/', {read: false})
        .pipe(plumber())
        .pipe(clean())
});
gulp.task('pullImage', ['cleanImage'], function () {
    return gulp.src('src/image/*.?(jpg|png)')
        .pipe(plumber())
        .pipe(gulp.dest('dist/image'));
});

gulp.task('nunjucks', ['cleanHtml', 'pullImage'], function () {
    return gulp.src('src/template.html')
        .pipe(plumber())
        .pipe(nunjucksRender({data: {
            resourcePath: resourcePath,
            list : arrData,
            list1Title : list1.title,
            list1Content: list1.content,
            list2Title : list2.title,
            list2Content: list2.content,
            list3Title : list3.title,
            list3Content: list3.content,
            list4Title : list4.title,
            list4Content: list4.content,
            listTxtArr: listTxtArr
        }}))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('dist/html'));
});

//  生成线上文件目录，目录名为当天日期，例如：“08.31”
gulp.task('clearPublish', function () {
    return gulp.src('./{0..9}{0..9}.{0..9}{0..9}', {read: false})
        .pipe(plumber())
        .pipe(clean());
});
gulp.task('publish', ['clearPublish'], function () {
    return gulp.src(['dist/html/index.html', 'dist/image/*.?(jpg|png)'])
        .pipe(plumber())
        .pipe(gulp.dest('./'+ publishSrc+ '/image'));
});

// 监测模板和图片变动
gulp.watch(['gulpfile.js', 'src/*.html', 'src/iamge/*.?(jpg|png)'], ['nunjucks']);

// 执行默认任务
gulp.task('default', function () {
    if(oTestFlag){
        var timer = setInterval(function () {
            if(typeof list1.content !== 'undefined' && typeof list2.content !== 'undefined' && typeof list3.content !== 'undefined' && typeof list4.content !== 'undefined'){
                gulp.start('nunjucks');
                clearInterval(timer);
            }
        }, 500);
    }
    else{
        gulp.start('publish');
    }
});