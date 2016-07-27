<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="BaiduMap.aspx.cs" Inherits="Generoft.AM.Public.Map.Web.BaiduMap" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="formMap" runat="server">
    <div id="divMap" style="width:100%; height:100%;position:absolute" runat="server"> 
    </div>
    </form>
</body>
</html>
<script type="text/javascript" language=javascript>
    function onload() {
        if (defaultLng != null && defaultLat != null) {
            if (defaultLevel != null)
                centerAndZoom(defaultLng, defaultLat, defaultLevel);
            else
                loadMap(defaultLng, defaultLat);
        }
	else
	   loadMap(117.024967, 36.682785);
	addDefaultNavigationControl();
	enableScrollWheelZoom();
    }
    onload();      
 </script>
