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
var maplistbymk = JSON.parse(window.external.GetMapSetByMK());
var option;
var stddata;
var stddatadimension;
var stdss = JSON.parse(myMapSet.SeriesSet);
var valuecolname =[];
var haveseries = true;
if(stdss.SeriesCol==null||stdss.SeriesCol == 'undefined') haveseries = false;
for (var i = 0; i < stdss.ValueCols.length; i++) {
    valuecolname.push(stdss.ValueCols[i].Name);
};

initMap();
document.getElementById("float").style.visibility ='hidden';
barchart();
myChart.on('dblclick', function(params) {
    loadData(params.name);

});
//价值分析时通过选择地图进行柱状图对比
myChart.on('mapselectchanged', function(params) {
    if (haveseries) return;
    var selected = params.selected;
    var names = [];
    for (var i = 0; i < stddata.length; i++) {
        if (selected[stddata[i].AreaName]) {
            names.push(stddata[i].AreaName);
        }
    }
    var optiontemp = {
        legend: {
            data: valuecolname
        },
        yAxis: {
            data: names
        },
        series: getbardataseries(names)
    }
    myChartBar.setOption(optiontemp);
    //if(params.name == )
});
//其余通过选择图例
myChart.on('legendselectchanged', function(params) {
        if (!haveseries) return;
        if (stddatadimension == null || stddatadimension == 'undefined') return;
        var selected = params.selected;
        var data = summarizedatabydimension(stddatadimension, stdss);
        var names = [];
        var seriesdata = [];
        for (var o in data) {
            if (selected[o]) {
                names.push(o);
            }
        }
        var optiontemp = {
            legend: {
                data: valuecolname
            },
            yAxis: {
                data: names
            },
            series: getbardataseries(names, data)
        }
        myChartBar.setOption(optiontemp);

    })
    //初始化地图数据
function initMap() {
    if (myMapAreas != null && myMapAreas.length > 0) {
        if (myCurMapPath == null)
            loadAreaData(myMapAreas[1]);
        else
            returnParent(); //返回上级（百度地图返回时）
    }
}
//返回上级
function returnParent() {
    if (myMapAreas != null && myMapAreas.length > 0) {
        if (myCurMapPath == null || myCurMapPath.length == 4)
            loadAreaData(myMapAreas[0]);
        else
            loadDataByPath(myCurMapPath.substr(0, myCurMapPath.length - 4));
    }
}
//设置取值列
function setValueCol(colname) {
    myValueCol = colname;
    refreshMap();
}
//刷新数据-当前级
function refreshMap() {
    if (myMapAreas != null && myMapAreas.length > 0) {
        if (myCurMapPath == null || myCurMapPath.length == 4)
            loadAreaData(myMapAreas[0]);
        else
            loadDataByPath(myCurMapPath);
    }
}
//根据分级码加载数据
function loadDataByPath(path) {
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
function loadData(name) {
    var area = getMapArea(name);
    loadAreaData(area);
}
//加载区域数据
function loadAreaData(area) {
    if (area == null || area == "undefined")
        return;
    if (area["Data"] == null) {
        area["Data"] = JSON.parse(window.external.GetAreaDataJson(myMapCode, area.Path, area.Grade, myCond, myExtInfo));
    }
    stddatadimension = area["Data"];
    if (area.IsDetail == "1") {
        //if (area.data == "undefined" || area.data == null) return;
        var h = "MapQueryBaidu.html?map=" + myMapCode + "&areapath=" + area.Path + "&areaname=" + area.Name;
        if (myValueCol != null)
            h += "&valuecol=" + myValueCol;
        window.location.href = h;
        return;
    }

    myCurMapPath = area.Path;
    if (echarts.getMap(area.Name) == null) {
        if (area.MapFile == null || area.MapFile == "")
            return;
        $.get("echarts/data/" + encodeURI(area.MapFile) + ".json", {}, function(mapJson) {
            echarts.registerMap(area.Name, mapJson);
            showAreaData(area);
        });
        return;
    }
    showAreaData(area);
}
//获取当前区域包含的序列名称集合
function getSerieNames(area) {
    if (stdss == null)
        return null;
    var snames = [];
    if (stdss.SeriesCol == "undefined" || stdss.SeriesCol == null) {
        var count = stdss.ValueCols.length;
        for (var i = 0; i < count; i++)
            snames.push(stdss.ValueCols[i].Name);
    } else {
        var d = area.Data;
        if (d != "undefined" && d != null) {
            var c = d.length;
            var s = ",";
            for (var j = 0; j < c; j++) {
                var t = d[j][stdss.SeriesCol.NameCol];
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
    var series = [];
    var valueCol = myValueCol == null ? stdss.ValueCols[0].Col : myValueCol;
    var selectmode;
    if (!haveseries) selectmode = 'multiple';
    else selectmode = false;
    if (stdss.SeriesCol == "undefined" || stdss.SeriesCol == null) {
        var count = stdss.ValueCols.length;
        for (var i = 0; i < count; i++) {
            var s = {
                name: stdss.ValueCols[i].Name,
                type: 'map',
                mapType: area.Name,
                selectedMode: selectmode,
                scaleLimit: {
                    min: 0.5,
                    max: 2.0
                },
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: true
                    }
                },
                data: (function() {
                    var count1 = area.Data.length;
                    var da = [];
                    for (var j = 0; j < count1; j++)
                        da.push({
                            name: area.Data[j].AreaName,
                            value: area.Data[j][stdss.ValueCols[i].Col]
                        });
                    return da;
                })()
            };
            series.push(s);
        }
    } else {
        var d = area.Data;
        if (d != "undefined" && d != null) {
            var c = d.length;
            var s = {};
            for (var j = 0; j < c; j++) {
                var t = d[j][stdss.SeriesCol.NameCol];
                if (t == "undefined" || t == null || t == "")
                    continue;
                if (s[t] == "undefined" || s[t] == null) {
                    s[t] = {
                        name: t,
                        type: 'map',
                        mapType: area.Name,
                        selectedMode: selectmode,
                        scaleLimit: {
                            min: 0.5,
                            max: 2.0
                        },
                        label: {
                            normal: {
                                show: false
                            },
                            emphasis: {
                                show: true
                            }
                        },
                        data: [{
                            name: d[j].AreaName,
                            value: d[j][valueCol]
                        }]
                    };
                    series.push(s[t]);
                } else
                    s[t].data.push({
                        name: d[j].AreaName,
                        value: d[j][valueCol]
                    });
            }
        }
    }
    return series;
}
//加载区域数据
function showAreaData(area) {
    var selectmode;
    var legendnames = getSerieNames(area);
    var selected = {};
    if (!haveseries) {
        selectmode = 'single';
    } else {
        selectmode = 'multiple';
        for (var i = 0; i < legendnames.length; i++) {
            if (i == 0) selected[legendnames[i]] = true;
            else selected[legendnames[i]] = false;
        }
    }
    option = {
        backgroundColor: '#404a59',
        title: {
            text: myMapSet.MapName,
            subtext: area.Name,
            left: 'center',
            textStyle: {
                color: '#ccc'
            }
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            selectedMode: selectmode,
            selected: selected,
            data: legendnames,
            textStyle: {
                color: '#de771f'
            }
        },
        visualMap: {
            min: 0,
            max: 2500,
            left: 'right',
            top: 'bottom',
            text: ['高', '低'], // 文本，默认为数值文本
            calculable: true,
            realtime: false
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
                myDataView:{
                    show:true,
                    title:'数据列表',
                    icon:'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891',
                    onclick:function(){
                        document.getElementById('float').style.visibility = 'visible';
                        //document.getElementById('mainMap').style.display='none';
                    }
                },
                
                restore: {},
                saveAsImage: {}
            }
        },
        animation: false,
        series: getSeries(area)
    };
    myChart.setOption(option, true);
    settabledatas(area);
    piechart(area, myMapCode, myMapSet, myChartPie);
    //summarizedatabydimension(area.Data, JSON.parse(myMapSet.SeriesSet));
}
//根据名称获取区域
function getMapArea(name) {
    var count = myMapAreas.length;
    for (var i = 0; i < count; i++) {
        if (myMapAreas[i].Name == name)
            return myMapAreas[i];
    }
}

function settabledatas(area) {
    var names = []; //columnsname
    var datas = []; //data
    var series = true;
    //columnsname
    names.push({
        "title": "地区"
    });
    if (stdss == null)
        return null;
    if (stdss.SeriesCol == "undefined" || stdss.SeriesCol == null) {
        series = false;
    } else {
        names.push({
            "title": stdss.SeriesCol.Name
        });
    }
    var count = stdss.ValueCols.length;
    for (var i = 0; i < count; i++)
        names.push({
            "title": stdss.ValueCols[i].Name
        });
    //data
    var d = area.Data;
    for (var i = 0; i < d.length; i++) {
        var temp = [];
        temp.push(d[i].AreaName);
        if (series) temp.push(d[i][stdss.SeriesCol.NameCol]);
        for (var j = 0; j < count; j++) {
            temp.push(d[i][stdss.ValueCols[j].Col]);
        }
        datas.push(temp);

    }
    $(document).ready(function() {
        var result = $("#example").dataTable({
            "bDestroy": true,
            "scrollY": 400,
            "scrollCollapse": true,
            "data": datas,
            "columns": names
        });
    });
}


function piechart(area, strcode, mapset, chart) {

    var mapcode = strcode;
    var valuecol = myValueCol == null ? stdss.ValueCols[0].Col : myValueCol;
    var title;
    for (var i = 0; i < stdss.ValueCols.length; i++) {
        if (stdss.ValueCols[i].Col == valuecol) {
            title = stdss.ValueCols[i].Name;
            break;
        }
    }
    title = title + '地区分布';
    if (maplistbymk.PieTitle != null && maplistbymk.PieTitle != 'undefined') title = maplistbymk.PieTitle;
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
        series: [{
            name: '地区',
            type: 'pie',
            radius: '50%',
            center: ['50%', '60%'],
            data: getdatasofpie(area, stdss.ValueCols[0].Col).sort(function(a, b) {
                return a.value - b.value
            }),
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

        }]

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
        datas.push({
            value: d[i][valuecol],
            name: d[i].AreaName
        });
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
    //var optiontemp = option;
    var title = '资产价值对比';
    if (maplistbymk.PieTitle != null && maplistbymk.PieTitle != 'undefined') title = maplistbymk.BarTitle;
    var title1;
    if (stdss.SeriesCol == null || stdss.SeriesCol == 'undefined') title1 = '(按地区)';
    else title1 = '(按' + stdss.SeriesCol.Name + ')';
    
    //if (myMapCode == 'AMZCMapTypeCost' || myMapCode == 'AMZCMapLandCost') title = '(按类别)';
    //else if (myMapCode == 'AMZCMapOwnerCost') title = '(按权属)';
    //else if (myMapCode == 'AMZCMapAllCost') title = '(按地区)';
    var optionbar = {
        backgroundColor: '#2c343c',
        title: {
            text: title + title1,
            left: 'left',
            top: 20,
            textStyle: {
                color: '#ccc',
                fontSize:15
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
            top: '2px',
            textStyle: {
                color: '#ff006e'
            },
            selectedMode: 'single',
            right:20,
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
                rotate: 45
            }
        },
        yAxis: {
            type: 'category',
            data: [],
            axisLine: {
                lineStyle: {
                    color: '#ccc'
                }
            },
            axisLabel: {
                show: false
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
//参数为选中的地区序列 最多两参数
function getbardataseries() {
    var len = arguments.length;
    if (len < 1) return;
    var series = [];
    var names = arguments[0];
    for (var i = 0; i < stdss.ValueCols.length; i++) {
        var data = [];
        for (var j = 0; j < names.length; j++) {
            if (len == 1) { //地区对比
                for (var k = 0; k < stddata.length; k++) {
                    if (stddata[k].AreaName == names[j]) {
                        data.push(stddata[k][stdss.ValueCols[i].Col]);
                    }
                }
            } else if (len == 2) { //根据维度对比需要第二个参数 分组合计后的数据
                var bardata = arguments[1];
                for (var j = 0; j < names.length; j++) {
                    data.push(bardata[names[j]][stdss.ValueCols[i].Name]);
                }
            }

        }
        series.push({
            name: stdss.ValueCols[i].Name,
            type: 'bar',
            label: {
                normal: {
                    show: true,
                    formatter: '{b}'
                }
            },
            data: data
        });
    }
    return series;

}
//function getbardataseries(names,bardata) {
//    var series = [];
//    var ss = JSON.parse(myMapSet.SeriesSet);
//    for (var i = 0; i < ss.ValueCols.length; i++) {
//        var data = [];
//        for (var j = 0; j < names.length; j++) {
//            data.push(bardata[names[j]][ss.ValueCols[i].Name]);
//        }
//        series.push({ name: ss.ValueCols[i].Name, type: 'bar', data: data });
//    }
//    return series;

//}