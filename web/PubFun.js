//获取查询参数
function getQueryString(name) {
    //输入参数名称
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //根据参数格式，正则表达式解析参数
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
