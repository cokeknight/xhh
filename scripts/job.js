const fs = require('fs');
const path = require('path');
const http = require('http');
const querystring = require('querystring');

function getData(file) {
  const file1Path = path.resolve(__dirname, `../data/${file}.txt`);

  const data = fs.readFileSync(file1Path, {
    encoding: 'utf-8',
  });
  const output = {};
  data.split(/\r\n/g).forEach((item) => {
    const line = item.split(/\t/g);
    output[line[1]] = line[2];
  });
  return output;
}
const stockData = [];
const postData = querystring.stringify({
  txtShareholdingDate: '2019/12/05',
  btnSearch: '搜尋',
  sortDirection: 'asc',
  __VIEWSTATE: '/wEPDwUJNjIxMTYzMDAwZGQ79IjpLOM+JXdffc28A8BMMA9+yg==',
  __VIEWSTATEGENERATOR: 'EC4ACD6F',
  __EVENTVALIDATION: '/wEdAAdtFULLXu4cXg1Ju23kPkBZVobCVrNyCM2j+bEk3ygqmn1KZjrCXCJtWs9HrcHg6Q64ro36uTSn/Z2SUlkm9HsG7WOv0RDD9teZWjlyl84iRMtpPncyBi1FXkZsaSW6dwqO1N1XNFmfsMXJasjxX85jz8PxJxwgNJLTNVe2Bh/bcg5jDf8=',
  today: '20191206',
  sortBy: 'stockcode',
  alertMsg: '',
});

const options = {
  hostname: 'www.hkexnews.hk',
  port: 80,
  path: '/sdw/search/mutualmarket_c.aspx',
  method: 'POST',
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,de;q=0.6',
    'Cache-Control': 'max-age=0',
    Connection: 'keep-alive',
    Cookie: 'WT_FPC=id=112.10.56.179-691336720.30770805:lv=1575639723396:ss=1575639256489; TS016e7565=015e7ee6032c57de3023c8bc29b5bb7c95da4cc101bf8bff7a1d162364fc2d89ebcfff5e5a3c48be3be5e62aaed0ffb30c7edf23ef',
    Host: 'www.hkexnews.hk',
    Origin: 'https://www.hkexnews.hk',
    Referer: 'https://www.hkexnews.hk/sdw/search/mutualmarket_c.aspx?t=sh',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = http.request(options, (res) => {
  // console.log(`STATUS: ${res.statusCode}`);
  // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  let datas = '';

  res.setEncoding('utf8');
  res.on('data', (chunk) => {
  	datas += chunk;
  });
  res.on('end', () => {
  	const chunks = datas.split(/<tr class="row[0|1]"/g);
    chunks.forEach((item) => {
    	const stockName = item.match(/<td valign="top" class="arial12black">[\s\t\r]+([\w\W]{0,4})[\s\t\r]+<\/td>/);
    	const stockAmount = item.match(/<td valign="top" nowrap="nowrap" class="arial12black" style="text-align: right;">[\s\t\r]+([\w\W]{0,20})[\s\t\r]+<\/td>/);

    	if (stockName && stockAmount) {
    		stockData.push(`${stockName[1]} ${stockAmount[1].replace(/\r\n/g, '')}`);
    	}
    });
    console.log('stockData', chunks);
    // console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  // console.error(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
// const file1 = getData('20191018');
// const file9 = getData('20180902');
// const file2 = getData('20180710');
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
