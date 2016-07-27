using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Generoft.AM.Public.Map.SPI.Entity
{
    [Serializable]
    public class MarkerMap
    {
        public MarkerMap()
        {
            LongitudeExpress = "Longitude";
            LatitudeExpress = "Latitude";
            //IconExpress = "Icon";
            //LabelExpress = "Label";
            //TitleExpress = "Title";
            //InfoExpress = "Info";
        }
        public MarkerMap(string mapCode,string mapName,string longitude, string latitude, string icon, string label, string title, string info, string callInfo, 
            string seriesSet, string areaExpress, string mapOption, string ifOnlineMap,string tableName, string dataCols, string dataCond)
        {
            MapCode = mapCode;
            MapName = mapName;
            LongitudeExpress = longitude;
            LatitudeExpress = latitude;
            IconExpress = icon;
            LabelExpress = label;
            TitleExpress = title;
            InfoExpress = info;
            CallInfoExpress = callInfo;
            SeriesSet = seriesSet;
            AreaExpress = areaExpress;
            MapOption = mapOption;
            IfOnlineMap = ifOnlineMap=="1";
            TableName = tableName;
            DataCols = dataCols;
            DataCond = dataCond;
        }
        public string MapCode { get; set; }
        public string MapName { get; set; }
        public string LongitudeExpress { get; set; }
        public string LatitudeExpress { get; set; }
        public string IconExpress { get; set; }
        public string LabelExpress { get; set; }
        public string TitleExpress { get; set; }
        public string InfoExpress { get; set; }
        public string CallInfoExpress { get; set; }
        public string SeriesSet { get; set; }
        public string AreaExpress { get; set; }
        public string MapOption { get; set; }
        public bool IfOnlineMap { get; set; }
        public string TableName { get; set; }
        public string DataCols { get; set; }
        public string DataCond { get; set; }
    }
}
