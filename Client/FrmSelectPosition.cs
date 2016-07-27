using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using DevExpress.XtraEditors;
using Genersoft.Platform.AppFramework.ClientService;
using Genersoft.Platform.AppFrameworkGui.Core;

namespace Generoft.AM.Public.Map.Client
{
    [System.Runtime.InteropServices.ComVisibleAttribute(true)] 
    public partial class FrmSelectPosition : DevExpress.XtraEditors.XtraForm
    {
        public FrmSelectPosition()
        {
            InitializeComponent();
            
        }
        string _url = @"map/BaiduMap.aspx";
        public string url { get { return _url; } set { _url = value; } }

        public decimal Longitude{get;set;}
        public decimal Latitude { get; set; }
        CommonFuncForWeb commonFuncForWeb = new CommonFuncForWeb();

        private void FrmSelectPosition_Load(object sender, EventArgs e)
        {
            webBrowser1.Url=new Uri(ClientContext.Current.GetUrl(_url));
            commonFuncForWeb.WebBrowser = webBrowser1;
        }

        private void webBrowser1_DocumentCompleted(object sender, WebBrowserDocumentCompletedEventArgs e)
        {
            commonFuncForWeb.AddLocalSearchControl();
            commonFuncForWeb.SelectPos();
        }
        //重选
        private void barButtonItem2_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            try
            {
                commonFuncForWeb.CloseMarkerTool();
                commonFuncForWeb.ClearOverlays();
                commonFuncForWeb.SelectPos();
            }
            catch (Exception)
            {
                MessageService.ShowMessage("请等待地图加载完毕后再操作！");
            }
        }
        //取消
        private void barButtonItem3_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            this.DialogResult = DialogResult.Cancel;
            this.Close();
        }
        
        //确定
        private void barButtonItem1_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            if (commonFuncForWeb.TransferData == null)
            {
                MessageService.ShowMessage("请选择标注位置！");
                return;
            }
            string[] strs = Convert.ToString(commonFuncForWeb.TransferData).Split(new char[] { '~' });
            Longitude = decimal.Parse(strs[0]);
            Latitude = decimal.Parse(strs[1]);
            this.DialogResult = DialogResult.OK;
            this.Close();
        }        
    }
}