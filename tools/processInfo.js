/**
 * Created by bmqy on 2016/9/13.
 */

var doc = require('./doc');
var crawler = require('crawler');

exports.infosArr = [];
exports.getInfo = function() {
    var urlArr = [];
    var _listDoc = doc.doc2arr;
    for(var i=0; i<_listDoc.length; i=i+2){
        urlArr.push(_listDoc[i+1]);
    }

    var j=0;
    var art = new crawler({
        jQuery: true,
        maxConnections : 1,
        incomingEncoding: 'gb2312',
        callback: function (err, res, $) {
            var _infoUnitJson = {};
            _infoUnitJson.href = urlArr[j];
            _infoUnitJson.title = $('.body_left .title').text();
            _infoUnitJson.content = $('.body_left .text').text().replace(/\r*\n*\t*/gi, '').substring(0, 100) + '...';
            exports.infosArr.push(_infoUnitJson);
            j++;
            console.log(exports.infosArr);
            return exports.infosArr;
        }
    });
    art.queue(urlArr);
};
exports.getInfo();
