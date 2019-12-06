const request = require('request');
const fs = require('fs');
const moment = require('moment');
const XLSX = require('xlsx');
const mysql      = require('mysql');
const http = require('http');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stock',
});
const postData = JSON.stringify({ version: '2.0', appName: 'AYLCAPP', accountType: '2',
  sessionId: 'd1c8a79c3d8b49a7aa109cf3ad80bfe8', tokenId: 'd5e04c571d4e4df990d7f4c974c67ca9',
  userCode: '182892859', channel: 'PCH5', requestId: 'euzxmnhkua1448004858598',
  body: { pn: 31, ps: '20', asc: '0', profittype: '3' } });
const options = {
  hostname: 'stock.pingan.com',
  port: 443,
  path: '/ay/restapi/myprofit/getProfitInfoPage',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
  },
};

function download(uri, filename, callback) {
  const stream = fs.createWriteStream(`./data2/${filename}`, { encoding: 'utf8' });
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    let datas = '';

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      datas += chunk;
    });
    res.on('end', () => {
      console.log(datas);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  // write data to request body
  req.write(postData);
  req.end();
}
function getData() {
  const now = new Date();
  const lastDate = now.getTime(); // - 24 * 3600 * 1 * 1000;
  for  (let time = now.getTime(); time >= lastDate; time -= 24 * 3600 * 1000) {
    const day = moment(time).format('YYYY-MM-DD');
    const fileName = `./data2/${day}.txt`;

    if (!fs.existsSync(fileName) || !fs.statSync(fileName).size) {
      download(`http://www.szse.cn/api/report/ShowReport?SHOWTYPE=xlsx&CATALOGID=SGT_SGTCGSL&TABKEY=tab1&txtDate=${day}&random=0.8834547143171937`,
        `${day}.xlsx`, () => {
          console.log('下载成功');
        });
    } else {
      console.log(`${fileName}存在`, fs.statSync(fileName).size);
    }
  }
}

getData();
