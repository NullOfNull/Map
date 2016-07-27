var mapTool = new GSMapLib.MapTool(null);
var defaultMapTag = "divMap";
var defaultLng = 116.395645;
var defaultLat = 39.929986;
var defaultLevel = 4;
//设置地图元素ID
function setMapTag(mapTag)
{
	defaultMapTag=mapTag;
}
//设置默认地图级别，默认为15
function setDefaultLevel(level)
{
	mapTool.setDefaultLevel(level);
}
//加载地图，经度、维度
function loadMap(longitude, latitude)
{
	mapTool.loadMapLocation(defaultMapTag, longitude, latitude);
}
//加载地图，城市或行政区名称
function loadMapCity(city)
{
    mapTool.loadMapCity(defaultMapTag, city);
}
//地图定位、缩放
function centerAndZoom(longitude, latitude, level)
{
	var mo = mapTool.getMapObj();
        mapTool.setDefaultLevel(level);
	if (mo == null)
            mapTool.loadMapLocation(defaultMapTag, longitude, latitude);
	else
           mapTool.centerAndZoom(longitude, latitude);
}
//加载当前位置，浏览器定位
function loadLocalMap()
{
	mapTool.loadLocalMap(defaultMapTag);
}
//添加标注
function addMarker(longitude, latitude, icon, label, title, info, callInfo)
{
    mapTool.addMarker(longitude, latitude, icon, label, title, info, callInfo);
}
//批量添加标注，参数为对象{longitude, latitude, icon, label, title, info}数组
function addMarkers(matkerInfos)
{
    mapTool.addMarker(matkerInfos);
}
//清除覆盖物
function clearOverlays()
{
	mapTool.clearOverlays();
}
//选择标注位置,参数-回调函数，参数为2个，经度、维度
function selectPos(callback)
{
	mapTool.openMarkerTool(null,callback);
}
//选择标注位置,供C#调用,返回"经度~维度"
function selectPosExt() {
    mapTool.openMarkerTool(null, "_external_markend");
}
function _external_markend(lng, lat) { window.external.TransferData = lng.toString() + "~" + lat.toString(); }
//关闭标注工具
function closeMarkerTool() {
    mapTool.closeMarkerTool();
}
//设置地图视野
function setViewport(points) {
    mapTool.setViewport(points);
}
//添加控件
function addControl(control) {
    mapTool.addControl(control);
}
//添加地图平移缩放控件
function addNavigationControl(opts) {
    mapTool.addNavigationControl(opts);
}
function addDefaultNavigationControl() {
    mapTool.addDefaultNavigationControl();
}
//添加搜索控件
function addLocalSearchControl()
{
    mapTool.addLocalSearchControl();
}
//移除控件
function removeControl(control) {
    mapTool.removeControl(control);
}
//移除地图平移缩放控件
function removeNavigationControl() {
    mapTool.removeNavigationControl();
}
//滚轮缩放设置
function enableScrollWheelZoom() {
    mapTool.enableScrollWheelZoom();
}
function disableScrollWheelZoom() {
    mapTool.disableScrollWheelZoom();
}
