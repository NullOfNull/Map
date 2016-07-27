var myMapCode = getQueryString("map");
var myCond = getQueryString("cond");
var myExtInfo = getQueryString("extinfo");
var myCurMapPath = getQueryString("areapath");
var myValueCol = getQueryString("valuecol");
var myAreaName = getQueryString("areaname");
function onload() {
    loadMapCity(myAreaName);
    addDefaultNavigationControl();
    enableScrollWheelZoom();
    window.external.LoadMarkers(myMapCode, myCurMapPath, "", "");
}
onload();
//返回上级
function returnParent() {
    var h = "MapQuery.html?map=" + myMapCode + "&areapath=" + myCurMapPath;
    if (myValueCol != null)
        h += "&valuecol=" + myValueCol;
    window.location.href = h;
}
//刷新数据-当前级
function refreshMap() {
    
}
//设置取值列
function setValueCol(colname) {
    myValueCol = colname;
}