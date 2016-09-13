/**
 * Created by bmqy on 2016/9/13.
 */

var doc = require('./doc'); // edm文档内容
var func = require('./function'); // 处理函数

exports.settings = {
    // 线上/线下开关：“true”为线下测试、“false”为线上发布
    debug: true,
    // 图片资源路径当天日期目录，此目录名对应ftp服务器edm存放日期目录
    pathDate: func.getYear() +'/'+ func.getYear() + func.getMonth() + func.getDay(),
    // 发布版本目录
    pathPublish: func.getMonth() +'.'+ func.getDay(),
    // 测试图片资源路径
    pathResTest: '../image/',
    // 线上图片资源路径
    pathResPublish: 'http://file.ibicn.com/edm/'+ this.pathDate +'/',
    imageSrc: function () {
        return this.debug ? this.pathResTest : this.pathResPublish;
    }
};