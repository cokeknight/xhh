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
	var result1 = {{b3|safe }};
	var result2 = {{b2|safe }};
	var data1 = result1.map(function (item){
		return item.count
	})
	var timelist1 = result1.map(function (item){
		return moment.unix(item.date).format('YYYYMMDD')
	})

	var data2 = result2.map(function (item){
		return item.count
	})
	var timelist2 = result2.map(function (item){
		return moment.unix(item.date).format('YYYYMMDD')
	})
	var option = {
	tooltip: {
      trigger: 'axis',
      formatter: function(d){
      	let data = d[0]
      	let date = data.axisValue
      	let stock = result1.find(function (item) {
      		return moment.unix(item.date).format('YYYYMMDD') == date
      	})
      	let output = JSON.parse(stock.data).map(function (item) {
      		return item[1]
      	})
      	return `个数${data.value}时间${date}${output.join()}`
      }
    },
    xAxis: {
        type: 'category',
        data: timelist1
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: data1,
        type: 'line'
    },{
        data: data2,
        type: 'line'
    }]
	};
	 myChart.setOption(option);

</script>
</body>
</html>

