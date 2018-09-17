'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/calculate2b', controller.home.calculate2b);
  router.get('/calculate3b', controller.home.calculate3b);
  router.get('/calculateZT', controller.home.calculateZT);
  router.get('/f', controller.homef.index);
  router.get('/fcalculate2b', controller.homef.calculate2b);
  router.get('/fcalculate3b', controller.homef.calculate3b);
  router.get('/fcalculateZT', controller.homef.calculateZT);
};
