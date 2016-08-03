using DevExpress.XtraEditors;
using Generoft.AM.Public.Map.SPI.Entity;
using Genersoft.Platform.AppFramework.ClientService;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using System.Collections.Generic;

namespace Generoft.AM.Public.Map.Client
{
    public partial class FrmMapQuery : XtraForm
    {
        private string maptypelast = "";//用于记录当前分析维度
        private bool IsInit = true;
        public FrmMapQuery()
        {
            InitializeComponent();
            if(!DesignMode)
            {
                this.CommonFuncForWeb = new CommonFuncForWeb();
                MKID = "AM";
                MapCodeOfAreaSum = "AMZCMapAllCost";
            }
        }
        //地图数据编码AMMapSet--MapCode 预制
        private string MapCode { set; get; }
        /// <summary>
        /// mk 模块id *必须 默认为资产地图demo的id ‘AM’，如需要请修改
        /// </summary>
        public string MKID { get; set; }
        /// <summary>
        /// 设置按地区汇总所需的 mapcode 即饼图需要的数据源 code
        /// </summary>
        public string MapCodeOfAreaSum { get; set; }
        ///<summary>
        /// the extra name of bar title,it will overwrite the original bartitle
        ///</summary>
        public string BarTitle { get; set; }
        /// <summary>
        /// the extra name of pie title, it will overwrite the original pietitle
        /// </summary>
        public string PieTitle { get; set; }
        /// <summary>
        /// the extra name of map title,it will overwrite the original maptitle
        /// </summary>
        public string MapTitle { get; set; }
        /// <summary>
        /// grid title name
        /// </summary>
        public string GridTitle { get; set; }

        CommonFuncForWeb _commonFuncForWeb;
        /// <summary>
        /// general operation of web controller, you need set its value
        /// </summary>
        public CommonFuncForWeb CommonFuncForWeb
        {
            set
            {
                _commonFuncForWeb = value;
                _commonFuncForWeb.WebBrowser = this.webBrowser1;
            }
            get { return _commonFuncForWeb; }
        }
        private MKMapList dicMap;
        string _url = @"dppub/map/MapQuery.html";

        /// <summary>
        /// website address,it has default value,do not modify if you don not have a new address,
        /// it depends on where the html document is
        /// </summary>
        public string Url { get { return _url; } set { _url = value; } }

        //取值列变化
        private void barEditValueColSel_EditValueChanged(object sender, EventArgs e)
        {
            if (!htmlDocLoaded)
                return;
            string colName = Convert.ToString(barEditValueColSel.EditValue);
            MarkerMap mm = CommonFuncForWeb.GetMapSet(MapCode);
            JObject o = JsonConvert.DeserializeObject(mm.SeriesSet) as JObject;
            JArray valueCols = o.Value<JArray>("ValueCols");
            JToken valueCol = valueCols.First;
            while (valueCol != null)
            {
                if(valueCol.Value<string>("Name") == colName)
                {
                    CommonFuncForWeb.SetValueCol(valueCol.Value<string>("Col"));
                    return;
                }
                valueCol = valueCol.Next;
            }
        }
        bool htmlDocLoaded = false;
        private void InitTypeControl()
        {
            dicMap = new MKMapList(CommonFuncForWeb.GetMKMap(MKID));
            dicMap.MapTitle = this.MapTitle;
            dicMap.BarTitle = this.BarTitle;
            dicMap.PieTitle = this.PieTitle;
            dicMap.GridTitle = this.GridTitle;
            CommonFuncForWeb.MKMapList = dicMap;
            for (int i = 0; i < dicMap.Count; i++)
            {
                repositoryItemComboBox2.Items.Add(dicMap.GetName(dicMap[i]));
            }
            //repositoryItemComboBox2.Items.Add("资产价值分布");
            //repositoryItemComboBox2.Items.Add("资产类别分布");
            //repositoryItemComboBox2.Items.Add("资产权属分布");
            //repositoryItemComboBox2.Items.Add("土地房屋分布");
            barEditItemMapType.EditValue = repositoryItemComboBox2.Items[0];
            MapCode = dicMap.GetCode(barEditItemMapType.EditValue.ToString());
            maptypelast = barEditItemMapType.EditValue.ToString();
        }
        //设置代码修改后不触发事件
        private bool selfchange = false;
        /// <summary>
        /// 地图类别更换后切换地图编号
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void barEditItemMapType_EditValueChanged(object sender, EventArgs e)
        {
            if (selfchange) return;
            string maptype = barEditItemMapType.EditValue.ToString();
            
            string mapcodelast = MapCode;
            MapCode = dicMap.GetCode(maptype);
            //if (maptype == "资产价值分布")
            //{
            //    MapCode = "AMZCMapAllCost";
            //}
            //else if (maptype == "资产类别分布")
            //{
            //    MapCode = "AMZCMapTypeCost";
            //}
            //else if (maptype == "资产权属分布")
            //{
            //    MapCode = "AMZCMapOwnerCost";
            //}
            //else if (maptype == "土地房屋分布")
            //{
            //    MapCode = "AMZCMapLandCost";
            //}
            if (IsInit) return;
            DialogResult dia = MessageBox.Show("已更换分析维度,是否重新加载地图?", "分析维度更换", MessageBoxButtons.YesNo);
            if (dia == DialogResult.Yes)
            {
                maptypelast = maptype;
                InitWebrowser();
            }
            else
            {
                MapCode = mapcodelast;
                selfchange = true;
                barEditItemMapType.EditValue = maptypelast;
            }
            selfchange = false;
        }

        private void InitWebrowser()
        {
            webBrowser1.Url = new Uri(ClientContext.Current.GetUrl(_url + "?map=" + MapCode, "dppub"));
            MarkerMap mm = CommonFuncForWeb.GetMapSet(MapCode);
            JObject o = JsonConvert.DeserializeObject(mm.SeriesSet) as JObject;
            if (o.GetValue("SeriesCol") != null)
            {
                barEditValueColSel.Visibility = DevExpress.XtraBars.BarItemVisibility.Always;
                JArray valueCols = o.Value<JArray>("ValueCols");
                JToken valueCol = valueCols.First;
                repositoryItemComboBox1.Items.Clear();//避免重复添加
                while (valueCol != null)
                {
                    repositoryItemComboBox1.Items.Add(valueCol.Value<string>("Name"));
                    valueCol = valueCol.Next;
                }
                if (repositoryItemComboBox1.Items.Count > 0)
                    barEditValueColSel.EditValue = repositoryItemComboBox1.Items[0];
            }
            else
                barEditValueColSel.Visibility = DevExpress.XtraBars.BarItemVisibility.Never;
        }
        private void FrmMapQuery_Load(object sender, EventArgs e)
        {
            if (!DesignMode)
            {
                InitTypeControl();
                IsInit = false;
                InitWebrowser();
            }
        }

        private void webBrowser1_DocumentCompleted(object sender, WebBrowserDocumentCompletedEventArgs e)
        {
            htmlDocLoaded = true;
        }

        private void barBtnClose_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            Close();
        }
        //刷新
        private void barBtnRefresh_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            CommonFuncForWeb.RefreshMap();
        }
        //返回上级
        private void barBtnUpGrade_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            CommonFuncForWeb.ReturnParent();
        }

        
    }

    public class MKMapList
    {
        private Dictionary<string, string> dic = new Dictionary<string, string>();
        private Dictionary<string, string> dicback = new Dictionary<string, string>();
        private DataTable dt;
        public MKMapList(DataTable dt)
        {
            this.dt = dt;
            foreach (DataRow dr in dt.Rows)
            {
                dic.Add(dr["MapCode"].ToString(), dr["MapName"].ToString());
                dicback.Add(dr["MapName"].ToString(), dr["MapCode"].ToString());
            }
        }
        public int Count
        {
            get { return dt.Rows.Count; }
        }
        public DataTable MKMap
        {
            get { return dt; }
        }
        //the extra name of bar title
        public string BarTitle { get; set; }
        //the extra name of pie title
        public string PieTitle { get; set; }
        //the extra name of map title
        public string MapTitle { get; set; }
        //grid title name
        public string GridTitle { get; set; }

        public string this[int index]
        {
            get { return dt.Rows[index]["MapCode"].ToString(); }
        }

        public string GetName(string code)
        {
            return dic[code];
        }
        public string GetCode(string name)
        {
            return dicback[name];
        }
    }
}
