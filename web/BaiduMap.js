var GSMapLib = window.GSMapLib = GSMapLib || {};
(function() 
{
    var _callback="";
    //地图工具类--构造函数
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
            alert("尚未加载地图！");
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
    //打开地图
    MapTool.prototype.loadMap = function (map, point)
    {
        this._map = new BMap.Map(map);
        if (point == null)
            this._map.centerAndZoom(this._defaultPoint, this._defaultLevel);
        else
            this._map.centerAndZoom(point, this._defaultLevel);
    };
    //打开地图--经纬度
    MapTool.prototype.loadMapLocation = function (map, longitude, latitude) {
        this._map = new BMap.Map(map);
        this._map.centerAndZoom(new BMap.Point(longitude, latitude), this._defaultLevel);
    };
    //打开地图--城市或区域
    MapTool.prototype.loadMapCity = function (map, city) {
        this._map = new BMap.Map(map);
        this._map.centerAndZoom(city);
    };
    //打开某地地图
    MapTool.prototype.centerAndZoom = function (longitude, latitude) {
        if (this._map == null) {
            alert("地图尚未初始化！");
            return;
        }
        this._map.centerAndZoom(new BMap.Point(longitude, latitude), this._defaultLevel);
    };
    
    //打开本地地址地图
    MapTool.prototype.loadLocalMap = function (map) {
        if (navigator.geolocation) //使用浏览器的方式
        {
            window.tmpMapTag = map;
            navigator.geolocation.getCurrentPosition(function (position) { var point = new BMap.Point(position.coords.longitude, position.coords.latitude); var map = new BMap.Map(map); map.centerAndZoom(point, 15); },
                function (error) { 
                    switch (error.code) {
                    case error.TIMEOUT:
                        alert("连接超时，请重试");
                        break;
                    case error.PERMISSION_DENIED:
                        alert("您拒绝了使用位置共享服务，查询已取消");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("获取位置信息失败");
                        break;
                } });
        }
        else {
            this.loadMap(map, this._defaultPoint);
        }        
    };
    
    //打开添加点标注工具-需监听MarkerTool的markend事件
    MapTool.prototype.openMarkerTool = function (opts,callback) {
        var markerTool = this.getMarkerTool(opts);
        if (markerTool == null) {
            return null;
        }
	_callback = callback;
        markerTool.open();
    };
    //关闭添加点标注工具
    MapTool.prototype.closeMarkerTool = function () {
        if (this._markerTool == null) {
            return ;
        }
        this._markerTool.close();
    };
    //添加标注
    MapTool.prototype.addMarker = function (longitude, latitude, icon, label, title, info, callInfo) {
        if (this._map == null) {
            return null;
        }
        var mkr = new BMap.Marker(new BMap.Point(longitude, latitude), { icon: icon });
        //设置label
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
    //批量添加标注
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
    //清除覆盖物
    MapTool.prototype.clearOverlays = function () {
        if (this._map == null) {
            return;
        }
        this._map.clearOverlays();
    };
    //设置地图视野
    MapTool.prototype.setViewport = function (points) {
        if (this._map == null) {
            return;
        }
        var ps = new Array();
        for(var i=0;i<points.length;i++)
            ps.push(new BMap.Point(points[i][0],points[i][1]));
        this._map.setViewport(ps);
    };
    //添加控件
    MapTool.prototype.addControl = function (control) {
        if (this._map == null) {
            return;
        }
        this._map.addControl(control);
    };
    //添加地图平移缩放控件
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
    //添加搜索控件
    MapTool.prototype.addLocalSearchControl = function () {
        if (this._map == null) {
            return;
        }
        this._map.addControl(new BMap.LocalSearch(this._map));
    }
    //移除控件
    MapTool.prototype.removeControl = function (control) {
        if (this._map == null) {
            return;
        }
        this._map.removeControl(control);
    };
    //移除地图平移缩放控件
    MapTool.prototype.removeNavigationControl = function () {
        if (this._map == null) {
            return;
        }
        this._map.removeControl(new BMap.NavigationControl());
    };
    //滚轮缩放设置
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