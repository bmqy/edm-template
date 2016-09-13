/**
 * Created by bmqy on 2016/9/13.
 */

// 获取年份日期
var _date = new Date();
exports.getYear = function () {
    return _date.getFullYear();
};
exports.getMonth = function () {
    var _month = _date.getMonth() + 1;
    _month = _month < 10 ? '0'+ _month : _month;
    return _month;
};
exports.getDay = function () {
    var _day = _date.getDate();
    _day = _day < 10 ? '0'+ _day : _day;
    return _day;
};