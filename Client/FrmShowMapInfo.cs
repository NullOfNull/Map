using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using DevExpress.XtraEditors;
using Genersoft.Platform.AppFramework.ClientService;

namespace Generoft.AM.Public.Map.Client
{
    public partial class FrmShowMapInfo : DevExpress.XtraEditors.XtraForm
    {
        public FrmShowMapInfo()
        {
            InitializeComponent();
            this.CommonFuncForWeb = new CommonFuncForWeb();
        }
        //关闭
        private void barButtonItem3_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            this.Close();
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
        string _url = @"map/BaiduMap.aspx";
        public string url { get { return _url; } set { _url = value; } }

        private void FrmShowMapInfo_Load(object sender, EventArgs e)
        {
            webBrowser1.Url = new Uri(ClientContext.Current.GetUrl(_url));
        }

        private void webBrowser1_DocumentCompleted(object sender, WebBrowserDocumentCompletedEventArgs e)
        {
            if (!string.IsNullOrEmpty(MapCode))
            {
                CommonFuncForWeb.LoadData(MapCode);
            }
        }
    }
}