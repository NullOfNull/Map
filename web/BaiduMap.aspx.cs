using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Generoft.AM.Public.Map.Web
{
    public partial class BaiduMap : System.Web.UI.Page
    {
        protected override void OnInit(EventArgs e)
        {
            Response.Write(@"<script src=""http://api.map.baidu.com/api?v=2.0&ak=RmIXgjbCTUdtMMWWahCokupG"" type=""text/javascript""></script>");
            Response.Write(@"<script src=""http://api.map.baidu.com/library/MarkerTool/1.2/src/MarkerTool_min.js"" type=""text/javascript""></script>");
            Response.Write(@"<script src=""BaiduMap.js"" type=""text/javascript""></script>");
            Response.Write(@"<script src=""Map.js"" type=""text/javascript""></script>");
            base.OnInit(e);
        }
        protected void Page_Load(object sender, EventArgs e)
        {
            string lng = Request.QueryString.Get("lng");
            string lat = Request.QueryString.Get("lat");
            string level = Request.QueryString.Get("level");
            if (string.IsNullOrEmpty(lng) || string.IsNullOrEmpty(lat))
                return;
            if (string.IsNullOrEmpty(level))
                Response.Write(string.Format(@"<script language=javascript>defaultLng={0};defaultLat={1};</script>", lng, lat));
            else
                Response.Write(string.Format(@"<script language=javascript>defaultLng={0};defaultLat={1};defaultLevel={2};</script>", lng, lat, level));
        }
    }
}