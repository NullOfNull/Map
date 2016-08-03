using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Genersoft.Platform.Core.DataAccess;
using Generoft.AM.Public.Map.SPI.Entity;
using Genersoft.Platform.AppFramework.Service;
using System.Data;
using Genersoft.Platform.Core.Error;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Generoft.AM.Public.Map.Core
{
    public class MapManager
    {
        /// <summary>
        /// 获取地图标注
        /// </summary>
        /// <param name="mapCode"></param>
        /// <returns></returns>
        public virtual Markers GetMarkerMap(string mapCode, string areaPath, string cond, string extInfo)
        {
            IGSPDatabase Db = GSPContext.Current.Database;
            MarkerMap mm = GetMapSet(mapCode);
            if (string.IsNullOrEmpty(mm.TableName))
                return null;
            string cols = mm.DataCols;
            string group = mm.DataCols;
            JObject o = JsonConvert.DeserializeObject(mm.SeriesSet) as JObject;
            JArray valueCols = o.Value<JArray>("ValueCols");
            JToken valueCol = valueCols.First;
            while (valueCol != null)
            {
                cols = string.Format("{0},sum({1}) as {1}", cols, valueCol.Value<string>("Col"));
                valueCol = valueCol.Next;
            }
            string sql = string.Format(@"select {0} from {1},DPPubMapArea mapArea2 where mapArea2.Path like '{2}%' and {3}=mapArea2.AreaID and {4}{5} group by {6}",
                cols, mm.TableName, areaPath, mm.AreaExpress, mm.DataCond,
                string.IsNullOrEmpty(cond) ? "" : " and " + cond, group);
            DataTable dt = Db.ExecuteDataSet(sql).Tables[0];
            return new Markers(dt, mm);
        }
        /// <summary>
        /// 获取区域地图信息
        /// </summary>
        /// <returns></returns>
        public DataSet GetMapArea()
        {
            return GSPContext.Current.Database.ExecuteDataSet("select Path,AreaName2 as Name,Grade,IsDetail,case when IsDetail = '1' then '' else MapFile end as MapFile from DPPubMapArea order by AreaCode");
        }
        /// <summary>
        /// 获取地图设置
        /// </summary>
        /// <param name="mapCode">地图编号</param>
        /// <returns></returns>
        public MarkerMap GetMapSet(string mapCode)
        {
            IGSPDatabase Db = GSPContext.Current.Database;
            string sql = " SELECT * FROM DPPubMapSet WHERE MapCode={0}";
            DataTable dt = Db.ExecuteDataSet(sql, mapCode).Tables[0];
            if (dt.Rows.Count > 0)
            {
                DataRow row = dt.Rows[0];
                return new MarkerMap(Convert.ToString(row["MapCode"]), Convert.ToString(row["MapName"]),
                    Convert.ToString(row["LongitudeExpress"]), Convert.ToString(row["LatitudeExpress"]),
                    Convert.ToString(row["IconExpress"]), Convert.ToString(row["LabelExpress"]),
                    Convert.ToString(row["TitleExpress"]), Convert.ToString(row["InfoExpress"]),
                    Convert.ToString(row["CallInfoExpress"]), Convert.ToString(row["SeriesSet"]),
                    Convert.ToString(row["AreaExpress"]), Convert.ToString(row["MapOption"]),
                    Convert.ToString(row["IfOnlineMap"]), Convert.ToString(row["TableName"]),
                    Convert.ToString(row["DataCols"]), Convert.ToString(row["DataCond"])
                    );
            }
            throw new GSPException(string.Format("编号为[{0}]地图未找到，请预制！", mapCode));
        }
        /// <summary>
        /// 获取模块id下的所有地图列表
        /// </summary>
        /// <param name="mkid"></param>
        public DataTable GetMKMap(string mkid)
        {
            IGSPDatabase db = GSPContext.Current.Database;
            string sql = "select MapCode,MapName from DPPubMapSet where MKMark = {0}";
            DataTable dt = db.ExecuteDataSet(sql, mkid).Tables[0];
            //Dictionary<string, string> dic = new Dictionary<string, string>();
            return dt;
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
        public virtual DataSet GetAreaData(string mapCode,string areaPath, string areaGrade, string cond, string extInfo)
        {
            IGSPDatabase Db = GSPContext.Current.Database;
            MarkerMap mm = GetMapSet(mapCode);
            if (string.IsNullOrEmpty(mm.TableName) || string.IsNullOrEmpty(mm.AreaExpress))
                return null;
            string group = "mapArea.AreaName2";
            string cols = "mapArea.AreaName2 as AreaName";
            JObject o = JsonConvert.DeserializeObject(mm.SeriesSet) as JObject;
            JObject jobj = o.Value<JObject>("SeriesCol");
            if (jobj != null)
            {
                group = string.Format("{0},{1},{2}", group, jobj.Value<string>("IDExp"), jobj.Value<string>("NameExp"));
                cols = string.Format("{0},{1} as {2},{3} as {4}", cols, jobj.Value<string>("IDExp"), jobj.Value<string>("IDCol"), jobj.Value<string>("NameExp"), jobj.Value<string>("NameCol"));
            }
            JArray valueCols = o.Value<JArray>("ValueCols");
            JToken valueCol = valueCols.First;
            while(valueCol!=null)
            {
                cols = string.Format("{0},sum({1}) as {1}", cols, valueCol.Value<string>("Col"));
                valueCol = valueCol.Next;
            }
            string sql = string.Format(@"select {0} from {1},DPPubMapArea mapArea,DPPubMapArea mapArea2 
where mapArea.Path like '{2}%' and mapArea.Grade={3} and mapArea2.Path like mapArea.Path{4}'%' and {5}=mapArea2.AreaID and {6}{7} group by {8}",
                cols, mm.TableName, areaPath,Convert.ToInt32(areaGrade) + 1, Db.JoinSymbol, mm.AreaExpress, mm.DataCond, 
                string.IsNullOrEmpty(cond) ? "" : " and " + cond, group);
            return Db.ExecuteDataSet(sql);
        }

    }
}
