//获取查询参数
function getQueryString(name) {
    //输入参数名称
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //根据参数格式，正则表达式解析参数
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null; //返回参数值
}


function getdimensionnamebycode(strcode) {
    var codename;
    if (strcode == 'AMZCMapAllCost') {
        codename = "资产类别";
    }
    else if (strcode == 'AMZCMapTypeCost') {
        codename = "资产类别";
    }
    else if (strcode == 'AMZCMapOwnerCost') {
        codename = "所属单位";
    }
    else if (strcode == 'AMZCMapLandCost') {
        codename = "资产类别";
    }
    return codename;
}
function getdimensioncodebyname(strname) {
    var code;
    switch (strname) {
        case '资产价值': code = 'AMZCMapAllCost'; break;
        case '资产类别': code = 'AMZCMapTypeCost'; break;
        case '所属单位': code = 'AMZCMapOwnerCost'; break;
        default: code = 'AMZCMapAllCost'; break;
    }
    return code;
}
//按价值列汇总数据
function summarizedatabydimension(data,seriesset)
{
    var temp = {};
    
    for (var i = 0; i < data.length; i++) {
        var key = data[i][seriesset.SeriesCol.NameCol]
        if (!temp.hasOwnProperty(key)) {
            var sum = {};
            for (var j = 0; j < seriesset.ValueCols.length; j++) {
                var colname = seriesset.ValueCols[j].Name;
                sum[colname] = 0;
            }
            temp[key] = sum;
            for (var k = 0; k < seriesset.ValueCols.length; k++) {
                temp[key][seriesset.ValueCols[k].Name] = data[i][seriesset.ValueCols[k].Col];
            }
        }
        else {
            for (var k = 0; k < seriesset.ValueCols.length; k++) {
                temp[key][seriesset.ValueCols[k].Name] += data[i][seriesset.ValueCols[k].Col];
            }
        }
    }
    return temp;
}