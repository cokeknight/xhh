const fs = require('fs');
const path = require('path');
const http = require('http');
const querystring= require('querystring');
function getData (file) {
	const file1Path = path.resolve(__dirname, `../data/${file}.txt`)

	const data = fs.readFileSync(file1Path,{
		encoding: 'utf-8'
	});
	const output = {}
	data.split(/\r\n/g).forEach((item) => {
		let line = item.split(/\t/g)
		output[line[1]] = line[2]
	})
	return output
}
const stockData = []
const postData = querystring.stringify({
  'ddlShareholdingMonth': '09',
  ddlShareholdingYear: '2018',
  ddlShareholdingDay: 15
});

const options = {
  hostname: 'www.hkexnews.hk',
  port: 80,
  path: '/sdw/search/mutualmarket_c.aspx?t=sh',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  // console.log(`STATUS: ${res.statusCode}`);
  // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  let datas = ''

  res.setEncoding('utf8');
  res.on('data', (chunk) => {
  	datas += chunk
  });
  res.on('end', () => {
  	const chunks = datas.split(/<tr class="row[0|1]"/g)
    chunks.forEach((item) => {
    	const stockName = item.match(/<td valign="top" class="arial12black">[\s\t\r]+([\w\W]{0,4})[\s\t\r]+<\/td>/)
    	const stockAmount = item.match(/<td valign="top" nowrap="nowrap" class="arial12black" style="text-align: right;">[\s\t\r]+([\w\W]{0,20})[\s\t\r]+<\/td>/)
    	
    	if (stockName && stockAmount){
    		stockData.push(stockName[1]+ ' ' + stockAmount[1].replace(/\r\n/g, ''))
    	}
    })
    console.log(stockData)
    // console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  // console.error(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
const file1 = getData('20180824')
const file9 = getData('20180902')
const file2 = getData('20180710')
// Object.keys(file2).forEach((item) => {
// 	if (file2[item] && !file1[item]) {
// 		console.log('上个月不存在的',item)
// 		return;
// 	}
// 	if (!file2[item] || !file1[item]) return;
// 	let nowData = file2[item].replace(/,/g,'')
// 	let prevData = file1[item].replace(/,/g,'')
// 	if ((nowData-prevData)/prevData > 1 && (nowData-prevData)/prevData < 4 ) {
// 		console.log(item, nowData, prevData)
// 	}
// })