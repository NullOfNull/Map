using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.IO;
using Genersoft.Platform.Core.Error;
using System.Windows.Forms;
using Generoft.AM.Public.Map.SPI.Entity;
using System.Data;
using Genersoft.AM.Public.Pub.Client;
using Genersoft.AM.Public.Pub.SPI;
using Newtonsoft.Json;

namespace Generoft.AM.Public.Map.Client
{
    [System.Runtime.InteropServices.ComVisibleAttribute(true)] 
    public class CommonFuncForWeb
    {
        /// <summary>
        /// 服务端管理dll
        /// </summary>
        public string MgrAssembly { set; get; }
        /// <summary>
        /// 服务端管理类
        /// </summary>
        public string MgrClassName { set; get; }
        /// <summary>
        /// mkid
        /// </summary>
        public string MKID { get; set; }
        public MKMapList MKMapList
        {
            get;
            set;
        }
        public CommonFuncForWeb()
        {
            MgrAssembly = "Generoft.AM.Public.Map.Core.dll";
            MgrClassName = "Generoft.AM.Public.Map.Core.MapManager";
        }

        private PubClient pubClient = new PubClient();


        WebBrowser _webBrowser;
        /// <summary>
        /// 浏览器控件
        /// </summary>
        public WebBrowser WebBrowser
        {
            get { return _webBrowser; }
            set
            {
                _webBrowser = value;
                if (_webBrowser != null)
                    _webBrowser.ObjectForScripting = this;
            }
        }
        /// <summary>
        /// 反射调用C#方法
        /// </summary>
        /// <param name="callInfo">暂仅支持字符串类型参数；格式Genersoft.AM.Pub.BillControls.dll&Genersoft.AM.Pub.BillControls.SmartPart.ConditionEdit&funcname&params， params使用~分隔 </param>
        /// <returns></returns>
        public object Call(string callInfo)
        {
            string[] strs = callInfo.Split(new char[] { '&' });
            if (strs.Length < 3)
                return null;
            string filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, strs[0]);
            Assembly asm = null;
            if (!File.Exists(filePath))
            {
                Assembly[] asses = AppDomain.CurrentDomain.GetAssemblies();
                foreach (Assembly ass in asses)
                {
                    string name = ass.GetName().Name + ".dll";
                    if (name.IndexOf(strs[0], StringComparison.CurrentCultureIgnoreCase) >= 0)
                    {
                        asm = ass;
                        break;
                    }
                }
            }
            if (asm == null)
                asm = Assembly.LoadFrom(filePath);
            Type type = asm.GetType(strs[1], false);
            if (type == null)
                throw new GSPException(string.Format("程序集{0}里没有指定的类{1}！", filePath, strs[1]), ErrorLevel.Warning);
            ConstructorInfo[] constructorInfoArray = type.GetConstructors(BindingFlags.Instance
                            | BindingFlags.NonPublic
                            | BindingFlags.Public);
            object obj = null;
            foreach (ConstructorInfo ci in constructorInfoArray)
            {
                if (!ci.IsStatic && ci.GetParameters().Length == 0)
                {
                    obj = ci.Invoke(null);
                    break;
                }
            }
            if(obj == null)
                obj = asm.CreateInstance(strs[1]);
            string[] ps=(strs.Length == 3)?new string[]{}:strs[3].Split(new char[] { '~' });
            int count = ps.Length;
            Type[] paramTypes = new Type[count];
            for (int i = 0; i < count; i++)
            {
                paramTypes[i] = typeof(string);
            }
            MethodInfo mi = type.GetMethod(strs[2], paramTypes);
            return mi.Invoke(obj, ps);
        }

        private object transedData = null;
        /// <summary>
        /// 用于与浏览器传递数据
        /// </summary>
        public object TransferData
        {
            get { return transedData; }
            set
            {
                object oldValue = transedData;
                transedData = value;
                if (DataChanged != null)
                    DataChanged(this, new DataChangedEventArgs(oldValue, value));
            }
        }
        #region 常用地图功能封装，须与与Map.js同时使用
        /// <summary>
        /// 设置地图元素ID
        /// </summary>
        /// <param name="mapTag">地图元素ID</param>
        public void SetMapTag(string mapTag)
        {
	        WebBrowser.Document.InvokeScript("setMapTag",new object[]{mapTag});
        }
        /// <summary>
        /// 设置默认地图级别，默认为15
        /// </summary>
        /// <param name="level">地图级别</param>
        public void SetDefaultLevel(int level)
        {
	        WebBrowser.Document.InvokeScript("setDefaultLevel",new object[]{level});
        }

        /// <summary>
        /// 加载地图
        /// </summary>
        /// <param name="longitude">经度</param>
        /// <param name="latitude">维度</param>
        public void LoadMap(decimal longitude, decimal latitude)
        {
	        WebBrowser.Document.InvokeScript("loadMap",new object[]{longitude, latitude});
        }
        /// <summary>
        /// 地图定位、缩放
        /// </summary>
        /// <param name="longitude"></param>
        /// <param name="latitude"></param>
        /// <param name="level"></param>
        public void CenterAndZoom(decimal longitude, decimal latitude, int level)
        {
	        WebBrowser.Document.InvokeScript("centerAndZoom",new object[]{longitude, latitude, level});
        }
        /// <summary>
        ///加载当前位置，浏览器定位 
        /// </summary>
        public void LoadLocalMap()
        {
	        WebBrowser.Document.InvokeScript("loadLocalMap");
        }
        /// <summary>
        /// 添加标注
        /// </summary>
        /// <param name="longitude"></param>
        /// <param name="latitude"></param>
        /// <param name="icon"></param>
        /// <param name="label"></param>
        /// <param name="title"></param>
        /// <param name="info"></param>
        /// <param name="callInfo"></param>
        public void AddMarker(decimal longitude,decimal latitude,string icon,string label,string title,string info, string callInfo)
        {
	        WebBrowser.Document.InvokeScript("addMarker",new object[]{longitude, latitude, icon, label, title, info, callInfo});
        }
        /// <summary>
        /// 批量添加标注，参数为对象{longitude, latitude, icon, label, title, info, callInfo}数组
        /// </summary>
        /// <param name="markers">Markers</param>
        public void AddMarkers(Markers markers)
        {
            if (markers == null || markers.Count < 1)
                return;
            decimal[] ds = markers.GetRect();
            decimal lng = (ds[0] + ds[1]) / 2;
            decimal lat = (ds[2] + ds[3]) / 2;
            CenterAndZoom(lng, lat, 12);
            WebBrowser.Document.InvokeScript("setViewport", new object[] { new decimal[][] { new decimal[] { ds[0], ds[2] }, new decimal[] { ds[0], ds[3] }, new decimal[] { ds[1], ds[2] }, new decimal[] { ds[1], ds[3] } } });
            foreach(Marker m in markers)
                WebBrowser.Document.InvokeScript("addMarker",new object[]{m.longitude,m.latitude,m.icon,m.label,m.title,m.info,m.callInfo});
        }
        /// <summary>
        /// 批量添加标注
        /// </summary>
        /// <param name="table"></param>
        /// <param name="markerMap"></param>
        public void AddMarkers(DataTable table, MarkerMap markerMap)
        {
            if (table == null || markerMap == null)
                return;
            Markers markers = new Markers(table, markerMap);
            AddMarkers(markers);
        }

        /// <summary>
        /// 清除覆盖物
        /// </summary>
        public void ClearOverlays()
        {
	        WebBrowser.Document.InvokeScript("clearOverlays");
        }

        /// <summary>
        /// 选择标注位置,返回值存于TransferData，可捕获DataChanged事件后取用
        /// </summary>
        public void SelectPos()
        {
            transedData = null;
	        WebBrowser.Document.InvokeScript("selectPosExt");
        }
        /// <summary>
        /// 关闭标注工具
        /// </summary>
        public void CloseMarkerTool()
        {
            WebBrowser.Document.InvokeScript("closeMarkerTool");
        }

        /// <summary>
        /// 加载地图数据--作废
        /// </summary>
        /// <param name="mapCode"></param>
        public void LoadData(string mapCode)
        {
            Markers markers = pubClient.CommonOperate(new OperParam(MgrAssembly, MgrClassName, "GetMarkerMap", "", mapCode)) as Markers;
            AddMarkers(markers);
        }
        public void LoadMarkers(string mapCode, string areaPath, string cond, string extInfo)
        {
            Markers markers = GetMarkerMap(mapCode, areaPath, cond, extInfo);
            AddMarkers(markers);
        }
        private MarkerMap _markerMap = null;
        /// <summary>
        /// 获取地图设置
        /// </summary>
        /// <param name="mapCode">地图编号</param>
        /// <returns></returns>
        public MarkerMap GetMapSet(string mapCode)
        {
            if (_markerMap != null && _markerMap.MapCode == mapCode)
                return _markerMap;
            _markerMap = pubClient.CommonOperate(new OperParam(MgrAssembly, MgrClassName, "GetMapSet", "", mapCode)) as MarkerMap;
            return _markerMap;
        }
        /// <summary>
        /// 获取地图设置-json
        /// </summary>
        /// <param name="mapCode">地图编号</param>
        /// <returns></returns>
        public string GetMapSetJson(string mapCode)
        {
            MarkerMap mm = GetMapSet(mapCode);
            return mm == null ? string.Empty : JsonConvert.SerializeObject(mm);
        }
        /// <summary>
        /// 获取模块地图列表的json对象
        /// </summary>
        /// <returns></returns>
        public string GetMapSetByMK()
        {
            return MKMapList == null ? string.Empty : JsonConvert.SerializeObject(MKMapList);
        }
        private static DataSet _mapAreas = null;
        /// <summary>
        /// 预制的地图区域
        /// </summary>
        public DataSet MapAreas
        {
            get
            {
                if(_mapAreas==null)
                {
                    _mapAreas = pubClient.CommonOperate(new OperParam(MgrAssembly, MgrClassName, "GetMapArea", "")) as DataSet;
                }
                return _mapAreas;
            }
        }
        /// <summary>
        /// 预制的地图区域-json
        /// </summary>
        public string MapAreasJson
        {
            get
            {
                if (MapAreas == null)
                    return string.Empty;
                DataRow[] rows = MapAreas.Tables[0].Select("", "Path asc");
                StringBuilder sb = new StringBuilder("[");
                foreach(DataRow row in rows)
                {
                    sb.AppendFormat("{{\"Path\":\"{0}\",\"Name\":\"{1}\",\"Grade\":{2},\"IsDetail\":\"{3}\",\"MapFile\":\"{4}\"}},",
                        row["Path"], row["Name"], row["Grade"], row["IsDetail"], row["MapFile"]);
                 }
                sb.Remove(sb.Length - 1, 1);
                sb.Append("]");
                return sb.ToString(); //.Replace("\\", "\\\\")
                //return MapAreas == null ? string.Empty : JsonConvert.SerializeObject(MapAreas.Tables[0]);
            }
        }
        /// <summary>
        /// 获取区域统计数据
        /// </summary>
        /// <param name="mapCode">地图编号</param>
        /// <param name="areaPath">区域分级码</param>
        /// <param name="areaGrade">区域级数</param>
        /// <param name="cond">查询条件</param>
        /// <param name="extInfo">扩展信息(可用于自定义条件传递等)</param>
        /// <returns></returns>
        public DataSet GetAreaData(string mapCode, string areaPath, string areaGrade, string cond, string extInfo)
        {
            return pubClient.CommonOperate(new OperParam(MgrAssembly, MgrClassName, "GetAreaData", "", mapCode, areaPath, areaGrade, cond, extInfo)) as DataSet;
        }
        /// <summary>
        /// 获取区域统计数据-json
        /// </summary>
        /// <param name="mapCode">地图编号</param>
        /// <param name="areaPath">区域分级码</param>
        /// <param name="areaGrade">区域级数</param>
        /// <param name="cond">查询条件</param>
        /// <param name="extInfo">扩展信息(可用于自定义条件传递等)</param>
        /// <returns></returns>
        public string GetAreaDataJson(string mapCode, string areaPath, string areaGrade, string cond, string extInfo)
        {
            DataSet ds = GetAreaData(mapCode, areaPath, areaGrade, cond, extInfo);
            return ds == null ? string.Empty : JsonConvert.SerializeObject(ds.Tables[0]);
        }
        /// <summary>
        /// 获取地图标注
        /// </summary>
        /// <param name="mapCode"></param>
        /// <returns></returns>
        public Markers GetMarkerMap(string mapCode, string areaPath, string cond, string extInfo)
        {
            return pubClient.CommonOperate(new OperParam(MgrAssembly, MgrClassName, "GetMarkerMap", "", mapCode, areaPath, cond, extInfo)) as Markers;
        }

        public DataTable GetMKMap(string mkid)
        {
            DataTable dt = pubClient.CommonOperate(new OperParam(MgrAssembly, MgrClassName, "GetMKMap", "", mkid)) as DataTable;
            if (dt.Rows == null || dt.Rows.Count < 1)
            {
                throw new GSPException("模块ID预制不正确", ErrorLevel.Warning);
            }
            
            return dt;
        }
        /// <summary>
        /// 返回上级地图
        /// </summary>
        public void ReturnParent()
        {
            WebBrowser.Document.InvokeScript("returnParent");
        }
        /// <summary>
        /// 刷新
        /// </summary>
        public void RefreshMap()
        {
            WebBrowser.Document.InvokeScript("refreshMap");
        }
        /// <summary>
        /// 设置取值列
        /// </summary>
        /// <param name="col"></param>
        public void SetValueCol(string col)
        {
            WebBrowser.Document.InvokeScript("setValueCol",new object[] { col });
        }
        /// <summary>
        /// 添加搜索控件
        /// </summary>
        public void AddLocalSearchControl()
        {
            WebBrowser.Document.InvokeScript("addLocalSearchControl");
        }
        #endregion
        /// <summary>
        /// 浏览器脚本更新数据事件
        /// </summary>
        public event EventHandler<DataChangedEventArgs> DataChanged;
    }
}
