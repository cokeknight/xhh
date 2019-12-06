'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const vm = require('vm');
const currentDay = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

const log = (date, type) => {
  if (type === 'exist') {
    console.log(`${date.format('YYYYMMDD')}数据已经存在`);
  }
};

const getPrevDay = date => {
  let prevDay = date.subtract(1, 'days');
  if (prevDay.day() === 0) {
    prevDay = date.subtract(2, 'days');
  } else if (prevDay.day() === 6) {
    prevDay = date.subtract(1, 'days');
  }
  return prevDay;
};
class HomeController extends Controller {
  async index() {

    const result = await this.app.mysql.select('stock_calculate_3b');
    result.map(item => {
    	item.count = JSON.parse(item.data).length;
    	delete item.data;
    });
    await this.ctx.render('home/index.tpl', { result: JSON.stringify(result) });
  }
  async calculateZT() {
  	await this.loopDate(undefined, undefined, async date => {
  		await this.injectData(date);
  	});
  }
  async calculate2b() {
  	this.ctx.body = 'hi, calculate2b';
  	await this.loopDate(moment('2017-01-10'), undefined, async date => {
  		await this.inject2BData(date);
  	});
  }
  async calculate3b() {
  	this.ctx.body = 'hi, calculate3b';
  	await this.loopDate(moment('2017-01-11'), undefined, async date => {
  		await this.inject3BData(date);
  	});
  }
  async loopDate(initDate = moment('2017-01-01'), endDate = currentDay, callback) {
  	while (!initDate.isSame(endDate)) {
  		initDate = initDate.add(1, 'days');
  		if (initDate.day() === 6 || initDate.day() === 0) {
  			continue;
  		}
  		await callback(initDate);
  	}
  }

  async getStockData(date) {
  	const uri = `http://home.flashdata2.jrj.com.cn/limitStatistic/zt/${date.format('YYYYMMDD')}.js?_dc=1530422308647`;
  	const result = await this.ctx.curl(uri, {
  		dataType: 'text',
  	});

  	return result.data;
  }

  async injectData(date) {
    const stock = await this.app.mysql.get('stock', { date: date.unix() });
    if (stock) {
      console.log(`${date.format('YYYYMMDD')}数据已经存在`);
    } else {
      const stockDataCode = await this.getStockData(date);
      if (stockDataCode.indexOf('404 Not Found') != -1) {
        console.log(`${date.format('YYYYMMDD')}数据不存在`);
        return null;
      }
      const sandbox = {};
      vm.createContext(sandbox); // Contextify the sandbox
			 	vm.runInContext(stockDataCode, sandbox);
      const ztData = sandbox.zr_zt.Data;
      await this.app.mysql.insert('stock', {
        date: date.unix(),
        data: JSON.stringify(ztData),
        date_F: date.format('YYYYMMDD'),
      });

      console.log(stockDataCode);
    }
  }
  async getPrevDayStockData(prevDay) {
  	let prevStock = null;
  	while (prevStock === null) {
  		prevStock = await this.app.mysql.get('stock', { date: prevDay.unix() });
  		if (!prevStock) prevDay.subtract(1, 'days');
  	}
  	return prevStock;
  }
  async inject2BData(date) {
  	const result = await this.app.mysql.get('stock_calculate_2b', { date: date.unix() });
  	if (result) {
  		console.log(`${date.format('YYYYMMDD')}数据已经存在`);
  	} else {
      const B2Data = [];
	  	const stockData = await this.app.mysql.get('stock', { date: date.unix() });
	  	if (!stockData) {
	  		console.log(`${date.format('YYYYMMDD')}数据不存在`);
        return;
	  	}
	  	const sotckList = JSON.parse(stockData.data);
	  	const prevDay = getPrevDay(date.clone());
	  	for (const stock of sotckList) {
	  		const prevStock = await this.getPrevDayStockData(prevDay);
	  		if (!prevStock) continue;
	  		const prevSotckList = JSON.parse(prevStock.data);
	  		const exists = prevSotckList.find(item => {
	  			return item[0] === stock[0];
	  		});
	  		if (exists) {
	  			B2Data.push(stock);
	  		}
	  	}
	  	console.log(`${date.format('YYYYMMDD')}插入`);
	  	await this.app.mysql.insert('stock_calculate_2b', {
	  		date: date.unix(),
	  		data: JSON.stringify(B2Data),
	  		date_F: date.format('YYYYMMDD'),
	  	});
  	}
  }
  async inject3BData(date) {
  	const result = await this.app.mysql.get('stock_calculate_3b', { date: date.unix() });
  	if (result) {
  		console.log(`${date.format('YYYYMMDD')}数据已经存在`);
  	} else {
      const B3Data = [];
	  	const stockData = await this.app.mysql.get('stock', { date: date.unix() });
	  	if (!stockData) {
	  		console.log(`${date.format('YYYYMMDD')}数据不存在`);
        return;
	  	}
	  	const sotckList = JSON.parse(stockData.data);
	  	const prevDay = getPrevDay(date.clone());
	  	for (const stock of sotckList) {
	  		const prevStock = await this.getPrevDayStockData(prevDay);
	  		if (!prevStock) continue;
	  		const prev1SotckList = JSON.parse(prevStock.data);

	  		const prev2Day = getPrevDay(prevDay.clone());
	  		const prev2Stock = await this.getPrevDayStockData(prev2Day);
	  		if (!prev2Stock) continue;
	  		const prev2SotckList = JSON.parse(prev2Stock.data);

	  		const exists1 = prev1SotckList.find(item => {
	  			return item[0] === stock[0];
	  		});
	  		const exists2 = prev2SotckList.find(item => {
	  			return item[0] === stock[0];
	  		});
	  		if (exists1 && exists2) {
	  			B3Data.push(stock);
	  		}
	  	}
	  	console.log(`${date.format('YYYYMMDD')}插入`);
	  	await this.app.mysql.insert('stock_calculate_3b', {
	  		date: date.unix(),
	  		data: JSON.stringify(B3Data),
	  		date_F: date.format('YYYYMMDD'),
	  	});
  	}
  }
}

module.exports = HomeController;
