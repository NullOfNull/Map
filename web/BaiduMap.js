var GSMapLib = window.GSMapLib = GSMapLib || {};
(function() 
{
    var _callback="";
    //��ͼ������--���캯��
    var MapTool = GSMapLib.MapTool = function(map)
    {
        this._map = map;
        this._markerTool = null;
        this._defaultPoint = new BMap.Point(117.024967, 36.682785);
        this._defaultLevel = 15;
	this._callback = "";
    }
    MapTool.prototype.getMapObj = function () { return this._map; }
    MapTool.prototype.getMarkerTool = function (opts) 
    {
        if (this._map == null)
        {
            alert("��δ���ص�ͼ��");
            return null;
        }
//        if (this._markerTool != null){
        this._markerTool = new BMapLib.MarkerTool(this._map, opts);
	    this._markerTool.addEventListener("markend", function(evt){
		var mkr = evt.marker;var p=mkr.getPosition();
                if(_callback && _callback != "")
                    eval(_callback+"("+p.lng.toString()+","+p.lat.toString()+")"); 
		});
//        }
//        else if (opts != null) {
//            this._markerTool._opts.autoClose = opts.autoClose;
//            this._markerTool._opts.followText = opts.followText;
//            this._markerTool.setIcon(opts.icon);
//        }
        return this._markerTool;
    };

    MapTool.prototype.setDefaultPoint = function (point) {
        this._defaultPoint = point;
    };
    MapTool.prototype.setDefaultLevel = function (level) {
        this._defaultLevel = level;
    };
    //�򿪵�ͼ
    MapTool.prototype.loadMap = function (map, point)
    {
        this._map = new BMap.Map(map);
        if (point == null)
            this._map.centerAndZoom(this._defaultPoint, this._defaultLevel);
        else
            this._map.centerAndZoom(point, this._defaultLevel);
    };
    //�򿪵�ͼ--��γ��
    MapTool.prototype.loadMapLocation = function (map, longitude, latitude) {
        this._map = new BMap.Map(map);
        this._map.centerAndZoom(new BMap.Point(longitude, latitude), this._defaultLevel);
    };
    //�򿪵�ͼ--���л�����
    MapTool.prototype.loadMapCity = function (map, city) {
        this._map = new BMap.Map(map);
        this._map.centerAndZoom(city);
    };
    //��ĳ�ص�ͼ
    MapTool.prototype.centerAndZoom = function (longitude, latitude) {
        if (this._map == null) {
            alert("��ͼ��δ��ʼ����");
            return;
        }
        this._map.centerAndZoom(new BMap.Point(longitude, latitude), this._defaultLevel);
    };
    
    //�򿪱��ص�ַ��ͼ
    MapTool.prototype.loadLocalMap = function (map) {
        if (navigator.geolocation) //ʹ��������ķ�ʽ
        {
            window.tmpMapTag = map;
            navigator.geolocation.getCurrentPosition(function (position) { var point = new BMap.Point(position.coords.longitude, position.coords.latitude); var map = new BMap.Map(map); map.centerAndZoom(point, 15); },
                function (error) { 
                    switch (error.code) {
                    case error.TIMEOUT:
                        alert("���ӳ�ʱ��������");
                        break;
                    case error.PERMISSION_DENIED:
                        alert("���ܾ���ʹ��λ�ù�����񣬲�ѯ��ȡ��");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("��ȡλ����Ϣʧ��");
                        break;
                } });
        }
        else {
            this.loadMap(map, this._defaultPoint);
        }        
    };
    
    //����ӵ��ע����-�����MarkerTool��markend�¼�
    MapTool.prototype.openMarkerTool = function (opts,callback) {
        var markerTool = this.getMarkerTool(opts);
        if (markerTool == null) {
            return null;
        }
	_callback = callback;
        markerTool.open();
    };
    //�ر���ӵ��ע����
    MapTool.prototype.closeMarkerTool = function () {
        if (this._markerTool == null) {
            return ;
        }
        this._markerTool.close();
    };
    //��ӱ�ע
    MapTool.prototype.addMarker = function (longitude, latitude, icon, label, title, info, callInfo) {
        if (this._map == null) {
            return null;
        }
        var mkr = new BMap.Marker(new BMap.Point(longitude, latitude), { icon: icon });
        //����label
        var lbl = new BMap.Label(label, { offset: new BMap.Size(1, 1) });
        lbl.setStyle({ border: "solid 1px gray" });
        mkr.setLabel(lbl);
        mkr.setTitle(title); 
        this._map.addOverlay(mkr);
        if (info != null)
        {
            
            mkr.addEventListener("click", function (evt) {
                var _infoWin = new BMap.InfoWindow("", { offset: new BMap.Size(0, -10) });
                _infoWin.setContent(info); 
                mkr.openInfoWindow(_infoWin);

            });
        }
        if(callInfo!= null)
        {
            
            mkr.addEventListener("click", function (evt) { window.external.Call(callInfo);});
        }
        return mkr;
    };
    //������ӱ�ע
    MapTool.prototype.addMarkers = function (matkerInfos) {
        if (this._map == null) {
            return;
        }
        var mkrs = new Array();
        var len = matkerInfos.length; 
        for (var i = 0; i < len; i++)
        {
            var mkr = this.addMarker(matkerInfos[i].longitude, matkerInfos[i].latitude, matkerInfos[i].icon, matkerInfos[i].label, matkerInfos[i].title, matkerInfos[i].info, matkerInfos[i].callInfo);
            if (mkr != null && mkr != "undefined")
                mkrs.push(mkr);
        }
        return mkrs;
    };
    //���������
    MapTool.prototype.clearOverlays = function () {
        if (this._map == null) {
            return;
        }
        this._map.clearOverlays();
    };
    //���õ�ͼ��Ұ
    MapTool.prototype.setViewport = function (points) {
        if (this._map == null) {
            return;
        }
        var ps = new Array();
        for(var i=0;i<points.length;i++)
            ps.push(new BMap.Point(points[i][0],points[i][1]));
        this._map.setViewport(ps);
    };
    //��ӿؼ�
    MapTool.prototype.addControl = function (control) {
        if (this._map == null) {
            return;
        }
        this._map.addControl(control);
    };
    //��ӵ�ͼƽ�����ſؼ�
    MapTool.prototype.addNavigationControl = function (opts) {
        if (this._map == null) {
            return;
        }
        this._map.addControl(new BMap.NavigationControl(opts));
    };
    MapTool.prototype.addDefaultNavigationControl = function () {
        if (this._map == null) {
            return;
        }
        this._map.addControl(new BMap.NavigationControl());
    };
    //��������ؼ�
    MapTool.prototype.addLocalSearchControl = function () {
        if (this._map == null) {
            return;
        }
        this._map.addControl(new BMap.LocalSearch(this._map));
    }
    //�Ƴ��ؼ�
    MapTool.prototype.removeControl = function (control) {
        if (this._map == null) {
            return;
        }
        this._map.removeControl(control);
    };
    //�Ƴ���ͼƽ�����ſؼ�
    MapTool.prototype.removeNavigationControl = function () {
        if (this._map == null) {
            return;
        }
        this._map.removeControl(new BMap.NavigationControl());
    };
    //������������
    MapTool.prototype.enableScrollWheelZoom = function () {
        if (this._map == null) {
            return;
        }
        this._map.enableScrollWheelZoom();
    };    
    MapTool.prototype.disableScrollWheelZoom = function () {
        if (this._map == null) {
            return;
        }
        this._map.disableScrollWheelZoom();
    };   
}
)();