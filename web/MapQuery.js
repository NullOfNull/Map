var myChart = echarts.init(document.getElementById('mainMap'));
var myChartPie = echarts.init(document.getElementById('piedemo'));
var myChartBar = echarts.init(document.getElementById('bardemo'));
var myMapCode = getQueryString("map");
var myCond = getQueryString("cond");
var myExtInfo = getQueryString("extinfo");
var myMapSet = JSON.parse(window.external.GetMapSetJson(myMapCode));
var myMapAreas = JSON.parse(window.external.MapAreasJson);
var myCurMapPath = getQueryString("areapath");
var myValueCol = getQueryString("valuecol");
var option;
var stddata;

initMap();
barchart();
myChart.on('dblclick', function (params) {
    loadData(params.name);
    
});
myChart.on('mapselectchanged', function (params) {
    var selected = params.selected;
    var names = [];
    var ss = JSON.parse(myMapSet.SeriesSet);
    
    for (var i = 0; i < stddata.length; i++) {
        if (selected[stddata[i].AreaName]) {
            names.push(stddata[i].AreaName);
        }
    }
    var optiontemp = {
        legend: {
            data:['资产数量','资产原值','资产净值']
        },
        yAxis: {
            data: names
        },
        series: getbardataseries(names)
    }
    myChartBar.setOption(optiontemp);
    //if(params.name == )
});
//初始化地图数据
function initMap()
{
    if (myMapAreas != null && myMapAreas.length > 0) {
        if (myCurMapPath == null)
            loadAreaData(myMapAreas[1]);
        else
            returnParent(); //返回上级（百度地图返回时）
    }
}
//返回上级
function returnParent()
{
    if (myMapAreas != null && myMapAreas.length > 0) {
        if (myCurMapPath == null || myCurMapPath.length == 4)
            loadAreaData(myMapAreas[0]);
        else
            loadDataByPath(myCurMapPath.substr(0, myCurMapPath.length - 4));
    }
}
//设置取值列
function setValueCol(colname)
{
    myValueCol = colname;
    refreshMap();
}
//刷新数据-当前级
function refreshMap()
{
    if (myMapAreas != null && myMapAreas.length > 0) {
        if (myCurMapPath == null || myCurMapPath.length == 4)
            loadAreaData(myMapAreas[0]);
        else
            loadDataByPath(myCurMapPath);
    }
}
//根据分级码加载数据
function loadDataByPath(path)
{
    if (myMapAreas != null && myMapAreas.length > 0) {

        var count = myMapAreas.length;
        for (var i = 0; i < count; i++) {
            if (myMapAreas[i].Path == path) {
                loadAreaData(myMapAreas[i]);
                return;
            }
        }
    }
}
//加载数据
function loadData(name)
{
    var area = getMapArea(name); 
    loadAreaData(area);    
}
//加载区域数据
function loadAreaData(area)
{
    if (area == null || area == "undefined")
        return;
    if (area["Data"] == null) {
        area["Data"] = JSON.parse(window.external.GetAreaDataJson(myMapCode, area.Path, area.Grade, myCond, myExtInfo));
    }
    if (area.IsDetail == "1")
    {
        //if (area.data == "undefined" || area.data == null) return;
        var h = "MapQueryBaidu.html?map=" + myMapCode + "&areapath=" + area.Path
            + "&areaname=" + area.Name;
        if (myValueCol != null)
            h += "&valuecol=" + myValueCol;
        window.location.href =  h;
        return;
    }
   
    myCurMapPath = area.Path;
    if(echarts.getMap(area.Name)==null)
    {
        if (area.MapFile == null || area.MapFile == "")
            return;
        $.get("echarts/data/" + encodeURI(area.MapFile) + ".json", {}, function (mapJson) {
            echarts.registerMap(area.Name, mapJson); 
            showAreaData(area);
        });
        return;
    }
    showAreaData(area);
}
//获取当前区域包含的序列名称集合
function getSerieNames(area) {
    var ss = JSON.parse(myMapSet.SeriesSet);
    if (ss == null)
        return null;
    var snames = [];
    if (ss.SeriesCol == "undefined" || ss.SeriesCol == null)
    {
        var count = ss.ValueCols.length;
        for (var i = 0; i < count; i++)
            snames.push(ss.ValueCols[i].Name);
    }
    else
    {
        var d = area.Data;
        if (d != "undefined" && d != null)
        {
            var c = d.length;
            var s = ",";
            for (var j = 0; j < c; j++)
            {
                var t = d[j][ss.SeriesCol.NameCol];
                if (t == "undefined" || t == null || t == "" || s.indexOf("," + t + ",") >= 0)
                    continue;
                snames.push(t);
                s += t + ",";
            }
        }
    }
    return snames;
}
function getSeries(area) {
    var ss = JSON.parse(myMapSet.SeriesSet);
    var series = [];
    var valueCol = myValueCol == null ? ss.ValueCols[0].Col : myValueCol;
    if (ss.SeriesCol == "undefined" || ss.SeriesCol == null)
    {
        var count = ss.ValueCols.length;
        for (var i = 0; i < count; i++) {
            var s = {
                name: ss.ValueCols[i].Name,
                type: 'map',
                mapType: area.Name,
                selectedMode: 'multiple',
                scaleLimit: { min: 0.5, max: 2.0 },
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: true
                    }
                },
                data: (function () {
                    var count1 = area.Data.length;
                    var da = [];
                    for (var j = 0; j < count1; j++)
                        da.push({ name: area.Data[j].AreaName, value: area.Data[j][ss.ValueCols[i].Col] });
                    return da;
                })()
            };
            series.push(s);
        }
    }
    else
    {
        var d = area.Data;
        if (d != "undefined" && d != null) {
            var c = d.length;
            var s = {};
            for (var j = 0; j < c; j++) {
                var t = d[j][ss.SeriesCol.NameCol];
                if (t == "undefined" || t == null || t == "")
                    continue;
                if (s[t] == "undefined" || s[t] == null)
                {
                    s[t] = {
                        name: t,
                        type: 'map',
                        mapType: area.Name,
                        selectedMode: 'multiple',
                        scaleLimit: { min: 0.5, max: 2.0 },
                        label: {
                            normal: {
                                show: false
                            },
                            emphasis: {
                                show: true
                            }
                        },
                        data: [{ name: d[j].AreaName, value: d[j][valueCol] }]
                    };
                    series.push(s[t]);
                }
                else
                    s[t].data.push({ name: d[j].AreaName, value: d[j][valueCol] });
            }
        }
    }
    return series;
}
//加载区域数据
function showAreaData(area) {
    option = {
        backgroundColor: '#404a59',
        title: {
            text: myMapSet.MapName,
            subtext: area.Name,
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            selectedMode: 'single',
            data: getSerieNames(area)
        },
        visualMap: {
            min: 0,
            max: 2500,
            left: 'left',
            top: 'bottom',
            text: ['高', '低'],           // 文本，默认为数值文本
            calculable: true,
            realtime:false
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
                dataView: { readOnly: false },
                restore: {},
                saveAsImage: {}
            }
        },
        animation:false,
        series: getSeries(area)
    };
    myChart.setOption(option, true);
    settabledatas(area);
    piechart(area, myMapCode, myMapSet,myChartPie);
}
//根据名称获取区域
function getMapArea(name) {
    var count = myMapAreas.length;
    for (var i = 0; i < count; i++)
    {
        if (myMapAreas[i].Name == name)
            return myMapAreas[i];
    }
}

function settabledatas(area) {
    var names = [];//columnsname
    var datas = [];//data
    var series = true;
    //columnsname
    names.push({ "title": "地区" });
    var ss = JSON.parse(myMapSet.SeriesSet);
    if (ss == null)
        return null;
    if (ss.SeriesCol == "undefined" || ss.SeriesCol == null) {
        series = false;
    }
    else {
        names.push({ "title": getdimensionnamebycode(myMapCode) });
    }
    var count = ss.ValueCols.length;
    for (var i = 0; i < count; i++)
        names.push({ "title": ss.ValueCols[i].Name });
    //data
    var d = area.Data;
    for (var i = 0; i < d.length; i++)
    {
        var temp = [];
        temp.push(d[i].AreaName);
        if (series) temp.push(d[i][ss.SeriesCol.NameCol]);
        for (var j = 0; j < count; j++) {
            temp.push(d[i][ss.ValueCols[j].Col]);
        }
        datas.push(temp);
        
    }
    $(document).ready(function () {
        $("#example").dataTable({
            "bDestroy":true,
            "scrollY": 100,
            "scrollCollapse": true,
            "data": datas,
            "columns": names
        });
    });
}
function getdimensionnamebycode(strcode)
{
    var codename;
    if (strcode == 'AMZCMapAllCost') {
        codename = "资产类别";
    }
    else if (strcode == 'AMZCMapTypeCost') {
        codename = "资产类别";
    }
    else if (strcode == 'AMZCMapOwnerCost') {
        codename = "所属单位";
    }
    else if (strcode == 'AMZCMapLandCost') {
        codename = "资产类别";
    }
    return codename;
}

function piechart(area, strcode, mapset,chart) {
    
    var mapcode = strcode;
    var ss = JSON.parse(mapset.SeriesSet);
    var valuecol = myValueCol == null ? ss.ValueCols[0].Col : myValueCol;
    var title;
    for (var i = 0; i < ss.ValueCols.length; i++) {
        if (ss.ValueCols[i].Col == valuecol) {
            title = ss.ValueCols[i].Name;
            break;
        }
    }
    title = title + '地区分布比例';
    var optionPie = {
        backgroundColor: '#2c343c',

        title: {
            text: title,
            left: 'center',
            top: 20,
            textStyle: {
                color: '#ccc'
            }
        },

        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },

        //visualMap: {
        //    show: false,
        //    min: 80,
        //    max: 600,
        //    inRange: {
        //        colorLightness: [0, 1]
        //    }
        //},不需要
        series: [
            {
                name: '地区',
                type: 'pie',
                radius: '50%',
                center: ['50%', '60%'],
                data: getdatasofpie(area, ss.ValueCols[0].Col).sort(function (a, b) { return a.value - b.value }),
                roseType: 'angle',
                label: {
                    normal: {
                        textStyle: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20
                    }
                }
                
            }
        ]

    };
    chart.setOption(optionPie);

}
function getdatasofpie(area, columnname) {
    var datas = [];
    var d = JSON.parse(window.external.GetAreaDataJson("AMZCMapAllCost", area.Path, area.Grade, myCond, myExtInfo));
    stddata = d;
    var valuecol = myValueCol == null ? columnname : myValueCol;
    //default var colors = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
    for (var i = 0; i < d.length; i++) {
        datas.push({ value: d[i][valuecol], name: d[i].AreaName});
    }
    return datas;
}

function barchart(t) {
    //var mapcode = strcode;
    //var ss = JSON.parse(mapset.SeriesSet);
    //var valuecol = myValueCol == null ? ss.ValueCols[0].Col : myValueCol;area, strcode, mapse
    //var valuecolname = [];
    //for (var i = 0; i < ss.ValueCols.length; i++) {
     //   valuecolname.push(ss.ValueCols[i].Name);
    //}
    //title = title + '地区对比';
    var optiontemp = option;
    var optionbar = {
        backgroundColor: '#2c343c',
        title: {
            text: '资产价值地区对比',
            left: 'left',
            top:20,
            textStyle: {
                color: '#ccc'
            }
            //subtext: '数据来自网络'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            top:'2px',
            textStyle:{
                color: '#ff006e'
            },
            data: []
        },
        grid: {
            left: '10%'
            //right: '4%',
            //bottom: '3%',
            //containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
            axisLine: {
                lineStyle: {
                    color: '#ccc'
                }
            },
            axisLabel: {
                rotate:45
            }
        },
        yAxis: {
            type: 'category',
            data: [],
            axisLine: {
                lineStyle: {
                    color: '#ccc'
                }
            }
        },
        series: [
            //{
            //    name: '2011年',
            //    type: 'bar',
            //    data: [18203, 23489, 29034, 104970, 131744, 630230]
            //}
            //{
            //    name: '2012年',
            //    type: 'bar',
            //    data: [19325, 23438, 31000, 121594, 134141, 681807]
            //}
        ]
    };

    myChartBar.setOption(optionbar);
}
//参数为选中的地区序列
function getbardataseries(names)
{
    var series = [];
    var ss = JSON.parse(myMapSet.SeriesSet);
    for (var i = 0; i < ss.ValueCols.length; i++) {
        var data = [];
        for (var j = 0; j < names.length; j++) {
            for (var k = 0; k < stddata.length;k++)
            {
                if (stddata[k].AreaName == names[j]) {
                    data.push(stddata[k][ss.ValueCols[i].Col]);
                }
            }
        }
        series.push({ name: ss.ValueCols[i].Name, type: 'bar', data: data });
    }
    return series;

}
