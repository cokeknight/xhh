'use strict';
const path = require('path');
module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1530422156442_3681';

  // add your config here
  config.middleware = [];
  config.mysql = {
	  // database configuration
	  client: {
	    host: '127.0.0.1',
	    port: '3306',
	    user: 'root',
	    password: '12345',
	    database: 'xhh',
	  },
	  // load into app, default true
	  app: true,
	  // load into agent, default false
	  agent: false,
	};
	config.view = {
		defaultViewEngine: 'nunjucks',
    root: [
      path.join(appInfo.baseDir, 'app/view'),
      path.join(appInfo.baseDir, 'path/to/another'),
    ].join(',')
  };
  return config;
};
