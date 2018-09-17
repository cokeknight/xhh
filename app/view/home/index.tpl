<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title></title>
	<style type="text/css">
		#chart{
			width: 3200px;
			height: 800px;
		}
	</style>
</head>
<body>

<div id="chart"></div>
<script type="text/javascript" src="/public/echarts.min.js"></script>
<script type="text/javascript" src="/public/moment.min.js"></script>
<script type="text/javascript">
	var myChart = echarts.init(document.getElementById('chart'));
	result = {{result|safe }};
	var data = result.map(function (item){
		return item.count
	})
	var timelist = result.map(function (item){
		return moment.unix(item.date).format('YYYYMMDD')
	})
	var option = {
		tooltip: {
      trigger: 'axis'
    },
    xAxis: {
        type: 'category',
        data: timelist
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: data,
        type: 'line'
    }]
	};
	 myChart.setOption(option);

</script>
</body>
</html>

