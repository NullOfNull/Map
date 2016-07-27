using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;

namespace Generoft.AM.Public.Map.SPI.Entity
{
    [Serializable]
    public class Marker
    {
        public decimal longitude {get;set;}
        public decimal latitude  {get;set;}
        public string icon  {get;set;}
        public string label  {get;set;}
        public string title  {get;set;}
        public string info  {get;set;}
        public string callInfo { get; set; }
    }
    [Serializable]
    public class Markers : List<Marker>
    {
        public Markers():base()
        {
        }        
        public Markers(DataTable table, MarkerMap markerMap):base()
        {
            if (table == null || markerMap == null)
                return;
            if (string.IsNullOrEmpty(markerMap.LongitudeExpress) || string.IsNullOrEmpty(markerMap.LatitudeExpress))
                return;
            List<string> colNames = new List<string>();
            if (!table.Columns.Contains(markerMap.LongitudeExpress))
            {
                table.Columns.Add("ExpLongitudeExpress", typeof(decimal), markerMap.LongitudeExpress);
                colNames.Add("ExpLongitudeExpress");
            }
            else
                colNames.Add(markerMap.LongitudeExpress);
            if (!table.Columns.Contains(markerMap.LatitudeExpress))
            {
                table.Columns.Add("ExpLatitudeExpress", typeof(decimal), markerMap.LatitudeExpress);
                colNames.Add("ExpLatitudeExpress");
            }
            else
                colNames.Add(markerMap.LatitudeExpress);
            if (!string.IsNullOrEmpty(markerMap.LabelExpress) && !table.Columns.Contains(markerMap.LabelExpress))
            {
                table.Columns.Add("ExpLabelExpress", typeof(string), markerMap.LabelExpress);
                colNames.Add("ExpLabelExpress");
            }
            else
                colNames.Add(markerMap.LabelExpress);
            if (!string.IsNullOrEmpty(markerMap.TitleExpress) && !table.Columns.Contains(markerMap.TitleExpress))
            {
                table.Columns.Add("ExpTitleExpress", typeof(string), markerMap.TitleExpress);
                colNames.Add("ExpTitleExpress");
            }
            else
                colNames.Add(markerMap.TitleExpress);
            if (!string.IsNullOrEmpty(markerMap.IconExpress) && !table.Columns.Contains(markerMap.IconExpress))
            {
                table.Columns.Add("ExpIconExpress", typeof(string), markerMap.IconExpress);
                colNames.Add("ExpIconExpress");
            }
            else
                colNames.Add(markerMap.IconExpress);
            if (!string.IsNullOrEmpty(markerMap.InfoExpress) && !table.Columns.Contains(markerMap.InfoExpress))
            {
                table.Columns.Add("ExpInfoExpress", typeof(string), markerMap.InfoExpress);
                colNames.Add("ExpInfoExpress");
            }
            else
                colNames.Add(markerMap.InfoExpress);
            if (!string.IsNullOrEmpty(markerMap.CallInfoExpress) && !table.Columns.Contains(markerMap.CallInfoExpress))
            {
                table.Columns.Add("ExpCallInfoExpress", typeof(string), markerMap.CallInfoExpress);
                colNames.Add("ExpCallInfoExpress");
            }
            else
                colNames.Add(markerMap.CallInfoExpress);
            foreach (DataRow row in table.Rows)
            {
                if (row.RowState == DataRowState.Deleted || row.RowState == DataRowState.Detached)
                    continue;
                Marker marker = new Marker();
                marker.longitude = Convert.ToDecimal(row[colNames[0]]);
                marker.latitude = Convert.ToDecimal(row[colNames[1]]);
                if(!string.IsNullOrEmpty(colNames[2]))
                    marker.label = Convert.ToString(row[colNames[2]]);
                if (!string.IsNullOrEmpty(colNames[3]))
                    marker.title = Convert.ToString(row[colNames[3]]);
                if (!string.IsNullOrEmpty(colNames[4]))
                    marker.icon = Convert.ToString(row[colNames[4]]);
                if (!string.IsNullOrEmpty(colNames[5]))
                    marker.info = Convert.ToString(row[colNames[5]]);
                if (!string.IsNullOrEmpty(colNames[6]))
                    marker.callInfo = Convert.ToString(row[colNames[6]]);
                Add(marker);
            }
        }
        /// <summary>
        /// 获取标注所在的矩形区域的最大最小经度、最大最小纬度
        /// </summary>
        /// <returns></returns>
        public decimal[] GetRect()
        {
            decimal maxLng = decimal.Zero;
            decimal minLng = decimal.Zero;
            decimal maxLat = decimal.Zero;
            decimal minLat = decimal.Zero;
            int count = this.Count;
            if (count > 0)
            {
                Marker m = this[0];
                maxLng = m.longitude;
                minLng = m.longitude;
                maxLat = m.latitude;
                minLat = m.latitude;
                for (int i = 1; i < count; i++)
                {
                    m = this[i];
                    if (maxLng < m.longitude)
                        maxLng = m.longitude;
                    if (minLng > m.longitude)
                        minLng = m.longitude;
                    if (maxLat < m.latitude)
                        maxLat = m.latitude;
                    if (minLat > m.latitude)
                        minLat = m.latitude;
                }
            }
            return new decimal[] { maxLng, minLng, maxLat, minLat };
        }
    }
}
