using DevExpress.XtraEditors;
using Generoft.AM.Public.Map.SPI.Entity;
using Genersoft.Platform.AppFramework.ClientService;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace Generoft.AM.Public.Map.Client
{
    public partial class FrmMapQuery : XtraForm
    {
        private string maptypelast = "";//用于记录当前分析维度
        private bool IsInit = true;
        public FrmMapQuery()
        {
            InitializeComponent();
            this.CommonFuncForWeb = new CommonFuncForWeb();
        }
        //地图数据编码AMMapSet--MapCode
        public string MapCode { set; get; }
        CommonFuncForWeb _commonFuncForWeb;
        public CommonFuncForWeb CommonFuncForWeb
        {
            set
            {
                _commonFuncForWeb = value;
                _commonFuncForWeb.WebBrowser = this.webBrowser1;
            }
            get { return _commonFuncForWeb; }
        }
        string _url = @"dppub/map/MapQuery.html";
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
            repositoryItemComboBox2.Items.Add("资产价值分布");
            repositoryItemComboBox2.Items.Add("资产类别分布");
            repositoryItemComboBox2.Items.Add("资产权属分布");
            repositoryItemComboBox2.Items.Add("土地房屋分布");
            barEditItemMapType.EditValue = repositoryItemComboBox2.Items[0];
            MapCode = "AMZCMapAllCost";
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
            if (maptype == "资产价值分布")
            {
                MapCode = "AMZCMapAllCost";
            }
            else if (maptype == "资产类别分布")
            {
                MapCode = "AMZCMapTypeCost";
            }
            else if (maptype == "资产权属分布")
            {
                MapCode = "AMZCMapOwnerCost";
            }
            else if (maptype == "土地房屋分布")
            {
                MapCode = "AMZCMapLandCost";
            }
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
            InitTypeControl();
            IsInit = false;
            InitWebrowser();
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
}
