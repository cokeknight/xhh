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
function parseExcel(date) {
  return new Promise((resolve, reject) => {
    let excelData = [];
    // const paramsArr = [];
    // const nowTime = parseInt(moment().format('X'));

    const workbook = XLSX.readFile(`./data/${date}.xlsx`);
    // const sheetNames = workbook.SheetNames;
    for (const sheet in workbook.Sheets) {
      // eslint-disable-next-line
      if (workbook.Sheets.hasOwnProperty(sheet)) {
        // fromTo = workbook.Sheets[sheet]['!ref'];
        //解析excel文件得到数据
        excelData = excelData.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
      }
    }
    for (let i = 0; i < excelData.length; i++) {
      // console.log(excelData[i]);
      const  sql = `SELECT * FROM stock where name = '${excelData[i]['证券简称']}'`;
      //查

      connection.query(sql, (err, stock) => {
        if (err) {
          console.log('[SELECT ERROR] - ', err.message);
          reject();
          return;
        }
        if (!stock.length) {
          // console.log(`不存在${sql}`);
          connection.query(`insert into stock (id,name,code) VALUES(NULL,'${excelData[i]['证券简称']}','${excelData[i]['证券代码']}')`,
            (err, result) => {
              if (err) {
                console.log('[insert ERROR] - ', err.message);
                reject();
              }
            });
        } else {
          // console.log(`存在${stock}`);
          connection.query(`SELECT * FROM stock_data where id = '${stock[0].id}' and date='${date}'`, (err, stock_data) => {
            if (err) {
              console.log('[SELECT ERROR] - ', err.message);
              reject();
              return;
            }
            if (!stock_data.length) {
              // console.log(`insert into stock_data (id,date,data) VALUES(${stock[0].id},'${date}','${excelData[i]['持股数量']}')`);
              connection.query(`insert into stock_data (id,date,data) VALUES(${stock[0].id},'${date}','${excelData[i]['持股数量']}')`,
                (err, result) => {
                  if (err) {
                    console.log('[insert ERROR] - ', err.message);
                    reject();
                  }
                  if (i === excelData.length - 1) {
                    resolve();
                  }
                });
            } else {
              // console.log(`存在记录id = '${stock[0].id}' and date='${date}'`);
              if (i === excelData.length - 1) {
                resolve();
              }
            }
          });
        }
      });
    }
  });
}
async function parseExcelMain() {
  const now = new Date();
  const lastDate = now.getTime() - 24 * 3600 * 365 * 1000;
  const list = [];
  for  (let time = Date.parse('2019-11-16'); time >= lastDate; time -= 24 * 3600 * 1000) {
    const day = moment(time).format('YYYY-MM-DD');
    list.push(day);
  }
  for (const day of list) {
    console.log(day);
    await parseExcel(day);
  }
}
// getData();
// parseExcelMain();
function run() {
//  过去一个月 深股通 加仓

  const now =  '2019-11-14';//moment().format('YYYY-MM-DD');
  const prev = '2019-09-12';//moment().clone().subtract(1, 'months').format('YYYY-MM-DD');
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
// parseExcelMain();
run();
