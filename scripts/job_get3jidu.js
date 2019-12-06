
const request = require('request');
const fs = require('fs');
const moment = require('moment');
const XLSX = require('xlsx');
const mysql      = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stock',
});

function download(uri, filename, callback) {
  const stream = fs.createWriteStream(`./data/${filename}`, { encoding: 'utf8' });
  request(uri).pipe(stream).on('close', callback);
}
function getData() {
  const now = new Date();
  const lastDate = now.getTime() - 24 * 3600 * 365 * 1000;
  for  (let time = now.getTime(); time >= lastDate; time -= 24 * 3600 * 1000) {
    const day = moment(time).format('YYYY-MM-DD');
    const fileName = `./data/${day}.xlsx`;

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
connection.connect();

function StockDate(datelists, timeTransform) {
  let mydate = datelists.find((child => child[0] === timeTransform));
  if (!mydate) {
    mydate = datelists.find((child => child[0] === (timeTransform + 24 * 3600 * 1000)));
    if (!mydate)  {
      mydate = datelists.find((child => child[0] === (timeTransform + 24 * 3600 * 1000 * 2)));
    }
  }
  return mydate;
}

async function fetchXueQiuData(i, options, excelData, timeTransform) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
    // console.error('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('body:', body); // Print the HTML for the Google homepage.
      const output = JSON.parse(body);
      const mydate = StockDate(output.data.item, timeTransform);
      if (mydate) {
        console.log('涨跌幅', mydate[7]);
        // excelData[i]['涨幅'] =  mydate[7];
        resolve(mydate[7]);
      } else {
        resolve(null);
      }
    });
  });
}
async function parseExcel(date) {
  // return new Promise((resolve, reject) => {
  let excelData = [];
  // const paramsArr = [];
  // const nowTime = parseInt(moment().format('X'));

  const workbook = XLSX.readFile('./sss/aa.xlsx');
  // const sheetNames = workbook.SheetNames;
  for (const sheet in workbook.Sheets) {
    // eslint-disable-next-line
      if (workbook.Sheets.hasOwnProperty(sheet)) {
      // fromTo = workbook.Sheets[sheet]['!ref'];
      //解析excel文件得到数据
      excelData = excelData.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
    }
  }
  for (let i = 1696; i < excelData.length; i++) {
    // if (i === 0) {
    console.log(i, excelData[i]['股票简称'], excelData[i]['股票代码'], excelData[i]['预约披露日期']);
    //
    const code = excelData[i]['股票代码'];
    const time = `${excelData[i]['预约披露日期']}`;
    let codeTransform = '';
    if (code.indexOf('SZ') !== -1) {
      codeTransform = `SZ${code.split('.')[0]}`;
    } else {
      codeTransform = `SH${code.split('.')[0]}`;
    }
    if (time) {
      const timeTransform = new Date(`${time.substring(0, 4)}-${time.substring(4, 6)}-${time.substring(6, 8)}`).setHours(0);
      const options = {
        url: `https://stock.xueqiu.com/v5/stock/chart/kline.json?symbol=${codeTransform}&begin=1573997624491&period=day&type=before&count=-142&indicator=kline,pe,pb,ps,pcf,market_capital,agt,ggt,balance`,
        headers: {
          Cookie: 's=c91crdzmo4; xq_a_token=5e0d8a38cd3acbc3002589f46fc1572c302aa8a2; xq_r_token=670668eda313118d7214487d800c21ad0202e141; Hm_lvt_1db88642e346389874251b5a1eded6e3=1573618676,1573654778,1573705317,1573908233; u=591573910200418; device_id=9bf95c2f92386fa60b260b4bf4c4c630; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1573910211',
        },
      };
      // eslint-disable-next-line no-await-in-loop
      const scale = await fetchXueQiuData(i, options, excelData, timeTransform);
      // eslint-disable-next-line no-continue
      if (!scale) continue;
      const  sql = `SELECT * FROM stock where name = '${excelData[i]['股票简称']}'`;
      connection.query(sql, (err, stock) => {
        if (err) {
          console.log('[SELECT ERROR] - ', err.message);
          return;
        }
        if (!stock.length) {
          console.log(`不存在${sql}`);
          connection.query(`insert into stock (id,name,code,scale) VALUES(NULL,'${excelData[i]['股票简称']}','${excelData[i]['股票代码']}','${scale}')`,
            (err, result) => {
              if (err) {
                console.log('[insert ERROR] - ', err.message);
              }
            });
        } else {
          console.log(`存在${sql}`);
          connection.query(`update stock SET scale = '${scale}' WHERE name = '${excelData[i]['股票简称']}'`,
            (err, result) => {
              if (err) {
                console.log('[update ERROR] - ', err.message);
              }
            });
        }
      });
    }
    // }
    //查

    // connection.query(sql, (err, stock) => {
    //   if (err) {
    //     console.log('[SELECT ERROR] - ', err.message);
    //     reject();
    //     return;
    //   }
    //   if (!stock.length) {
    //     // console.log(`不存在${sql}`);
    //     // connection.query(`insert into stock (id,name,code) VALUES(NULL,'${excelData[i]['证券简称']}','${excelData[i]['证券代码']}')`,
    //       (err, result) => {
    //         if (err) {
    //           console.log('[insert ERROR] - ', err.message);
    //           reject();
    //         }
    //       });
    //   } else {
    //     // console.log(`存在${stock}`);
    //     connection.query(`SELECT * FROM stock_data where id = '${stock[0].id}' and date='${date}'`, (err, stock_data) => {
    //       if (err) {
    //         console.log('[SELECT ERROR] - ', err.message);
    //         reject();
    //         return;
    //       }
    //       if (!stock_data.length) {
    //         // console.log(`insert into stock_data (id,date,data) VALUES(${stock[0].id},'${date}','${excelData[i]['持股数量']}')`);
    //         // connection.query(`insert into stock_data (id,date,data) VALUES(${stock[0].id},'${date}','${excelData[i]['持股数量']}')`,
    //           (err, result) => {
    //             if (err) {
    //               console.log('[insert ERROR] - ', err.message);
    //               reject();
    //             }
    //             if (i === excelData.length - 1) {
    //               resolve();
    //             }
    //           });
    //       } else {
    //         // console.log(`存在记录id = '${stock[0].id}' and date='${date}'`);
    //         if (i === excelData.length - 1) {
    //           resolve();
    //         }
    //       }
    //     });
    //   }
    // });
  }
  return excelData;
  // });
}
async function parseExcelMain() {
  const now = new Date();
  const lastDate = now.getTime() - 24 * 3600 * 365 * 1000;
  const list = [];
  // for  (let time = Date.parse('2019-11-16'); time >= lastDate; time -= 24 * 3600 * 1000) {
  //   const day = moment(time).format('YYYY-MM-DD');
  //   list.push(day);
  // }
  // for (const day of list) {
  //   console.log(day);
  const excelData = await parseExcel();
  // const ss = XLSX.utils.json_to_sheet(excelData); //通过工具将json转表对象
  // const keys = Object.keys(ss).sort(); //排序 [需要注意，必须从A1开始]

  // const ref = `${keys[1]}:${keys[keys.length - 1]}`; //这个是定义一个字符串 也就是表的范围[A1:C5]
  // const workbookI = { //定义操作文档
  //   SheetNames: ['nodejs-sheetname'], //定义表明
  //   Sheets: {
  //     'nodejs-sheetname': Object.assign({}, ss, { '!ref': ref }), //表对象[注意表明]
  //   },
  // };

  // XLSX.writeFile(workbookI, './aa.xls'); //将数据写入文件
  // }
}
// getData();
// parseExcelMain();
function run() {
//  过去一个月 深股通 加仓

  const now =  '2019-10-29';//moment().format('YYYY-MM-DD');
  const prev = '2019-05-13';//moment().clone().subtract(1, 'months').format('YYYY-MM-DD');
  connection.query('SELECT * FROM stock', (err, stock) => {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    if (stock) {
    // for (let i = 0; i < stock.length; i++) {
    // console.log(131, `select * from stock_data where id = ${stock[i].id} and date = ${now}`);
      connection.query(`select * from stock_data left join stock on stock_data.id = stock.id where stock_data.date = '${now}'`, (err, fstock) => {
        if (err) {
          console.log('[SELECT ERROR] - ', err.message);
          return;
        }
        console.log(`select * from stock_data where and date = '${prev}'`);
        connection.query(`select * from stock_data where  date = '${prev}'`, (err, substock) => {
          if (err) {
            console.log('[SELECT ERROR] - ', err.message);
          }
          const output = [];
          for (let i = 0; i < fstock.length; i++) {
            const fstockn = fstock[i].data.replace(/,/ig, '');
            const currentsubstockn = substock.find(child => child.id === fstock[i].id);
            if (currentsubstockn) {
              const substockn = currentsubstockn.data.replace(/,/gi, '');
              output.push({
                id: fstock[i].id,
                name: fstock[i].name,
                amount: fstockn - substockn,
                scale: ((fstockn - substockn) / substockn).toFixed(1),
                now: fstockn,
                prev: substockn,
              });
            }
          }
          output.sort((A, B) => B.scale - A.scale);
          console.log(output.slice(0, 20));
        //
        });
      });
    // }
    }
  });
}
// getData();
parseExcelMain();
// run();
