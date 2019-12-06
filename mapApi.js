const http = require('http');
const options = {
  hostname: 'localhost',
  port: 7001,
  path: '/admin/authority/mapauthority',
  method: 'get'
};
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    //console.log(chunk);
    let res = JSON.parse(chunk);
    console.log(`变更记录: ${res.message}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// write data to request body
req.end();
