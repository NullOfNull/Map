var mapTool = new GSMapLib.MapTool(null);
var defaultMapTag = "divMap";
var defaultLng = 116.395645;
var defaultLat = 39.929986;
var defaultLevel = 4;
//���õ�ͼԪ��ID
function setMapTag(mapTag)
{
	defaultMapTag=mapTag;
}
//����Ĭ�ϵ�ͼ����Ĭ��Ϊ15
function setDefaultLevel(level)
{
	mapTool.setDefaultLevel(level);
}
//���ص�ͼ�����ȡ�ά��
function loadMap(longitude, latitude)
{
	mapTool.loadMapLocation(defaultMapTag, longitude, latitude);
}
//���ص�ͼ�����л�����������
function loadMapCity(city)
{
    mapTool.loadMapCity(defaultMapTag, city);
}
//��ͼ��λ������
function centerAndZoom(longitude, latitude, level)
{
	var mo = mapTool.getMapObj();
        mapTool.setDefaultLevel(level);
	if (mo == null)
            mapTool.loadMapLocation(defaultMapTag, longitude, latitude);
	else
           mapTool.centerAndZoom(longitude, latitude);
}
//���ص�ǰλ�ã��������λ
function loadLocalMap()
{
	mapTool.loadLocalMap(defaultMapTag);
}
//��ӱ�ע
function addMarker(longitude, latitude, icon, label, title, info, callInfo)
{
    mapTool.addMarker(longitude, latitude, icon, label, title, info, callInfo);
}
//������ӱ�ע������Ϊ����{longitude, latitude, icon, label, title, info}����
function addMarkers(matkerInfos)
{
    mapTool.addMarker(matkerInfos);
}
//���������
function clearOverlays()
{
	mapTool.clearOverlays();
}
//ѡ���עλ��,����-�ص�����������Ϊ2�������ȡ�ά��
function selectPos(callback)
{
	mapTool.openMarkerTool(null,callback);
}
//ѡ���עλ��,��C#����,����"����~ά��"
function selectPosExt() {
    mapTool.openMarkerTool(null, "_external_markend");
}
function _external_markend(lng, lat) { window.external.TransferData = lng.toString() + "~" + lat.toString(); }
//�رձ�ע����
function closeMarkerTool() {
    mapTool.closeMarkerTool();
}
//���õ�ͼ��Ұ
function setViewport(points) {
    mapTool.setViewport(points);
}
//��ӿؼ�
function addControl(control) {
    mapTool.addControl(control);
}
//��ӵ�ͼƽ�����ſؼ�
function addNavigationControl(opts) {
    mapTool.addNavigationControl(opts);
}
function addDefaultNavigationControl() {
    mapTool.addDefaultNavigationControl();
}
//��������ؼ�
function addLocalSearchControl()
{
    mapTool.addLocalSearchControl();
}
//�Ƴ��ؼ�
function removeControl(control) {
    mapTool.removeControl(control);
}
//�Ƴ���ͼƽ�����ſؼ�
function removeNavigationControl() {
    mapTool.removeNavigationControl();
}
//������������
function enableScrollWheelZoom() {
    mapTool.enableScrollWheelZoom();
}
function disableScrollWheelZoom() {
    mapTool.disableScrollWheelZoom();
}
