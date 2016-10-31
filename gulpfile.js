/**
 * Created by bmqy on 2016/8/19.
 */

var gulp = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var plumber = require('gulp-plumber');  // 阻止 gulp 插件发生错误时导致进程退出，并输出错误日志
var rename = require('gulp-rename');
var clean = require('gulp-clean');

var config = require('./tools/config'); // edm配置项
var doc = require('./doc');
var getInfo = require('./tools/processInfo'); // 获取咨询讯息


gulp.task('cleanHtml', function () {
    return gulp.src('dist/html', {read: false})
        .pipe(plumber())
        .pipe(clean());
});
gulp.task('cleanImage', function () {
    return gulp.src('dist/image', {read: false})
        .pipe(plumber())
        .pipe(clean())
});
gulp.task('pullImage', ['cleanImage', 'cleanHtml'], function () {
    return gulp.src('src/image/*.?(jpg|png)')
        .pipe(plumber())
        .pipe(gulp.dest('dist/image'));
});

gulp.task('nunjucks', ['pullImage', 'clearPublish'], function () {
    return gulp.src('src/template.html')
        .pipe(plumber())
        .pipe(nunjucksRender({data: {
            imageSrc: config.settings.imageSrc(),
            list : getInfo.infosArr
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
        .pipe(gulp.dest('./'+ config.settings.pathPublish+ '/image'));
});

// 监测模板和图片变动
gulp.watch(['gulpfile.js', 'src/*.html', 'src/iamge/*.?(jpg|png)'], ['nunjucks']);

// 执行默认任务
gulp.task('default', function () {
    if(config.settings.debug){
        var timer = setInterval(function () {
            if(getInfo.infosArr.length == (doc.doc2arr.length/2)){
                gulp.start('nunjucks');
                clearInterval(timer);
            }
        }, 500);
    }
    else{
        var timer2 = setInterval(function () {
            if(getInfo.infosArr.length == (doc.doc2arr.length/2)){
                gulp.start('publish');
                clearInterval(timer2);
            }
        }, 500);
    }
});
