'use strict';
const path = require('path');
module.exports = appInfo => {
  const config = exports = {
    mysql: {
      // 单数据库信息配置
      client: {
        // host
        host: '127.0.0.1',
        // 端口号
        port: '3306',
        // 用户名
        user: 'root',
        // 密码
        password: '123456',
        // 数据库名
        database: 'dailydata',
      },
      // 是否加载到 app 上，默认开启
      app: true,
      // 是否加载到 agent 上，默认关闭
      agent: false,
    },
    sequelize: {
      dialect: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      database: 'dailydata',
      timestamps: false,
    },
  };

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
