const fs = require('fs');
const path = require('path');

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
const file1 = getData('20180824')
const file9 = getData('20180902')
const file2 = getData('20180710')
Object.keys(file2).forEach((item) => {
	if (file2[item] && !file1[item]) {
		console.log('上个月不存在的',item)
		return;
	}
	if (!file2[item] || !file1[item]) return;
	let nowData = file2[item].replace(/,/g,'')
	let prevData = file1[item].replace(/,/g,'')
	if ((nowData-prevData)/prevData > 1 && (nowData-prevData)/prevData < 4 ) {
		console.log(item, nowData, prevData)
	}
})