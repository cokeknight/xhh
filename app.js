// app.js or agent.js
class AppBootHook {
  constructor(app) {
    this.app = app;
    this.webServlet = [];
    this.app.webServlet = (api, type = 'get') => (target, method, descriptor) => {
      let controller = target.constructor.name.toString();
      controller = controller[0].toLowerCase() + controller.substring(1);
      if (this.webServlet.find(item => item.api === api)) {
        throw new Error(`存在重名的url${api}`);
      }
      this.webServlet.push({
        api,
        type,
        method: `${controller}.${method}`,
      });
      console.log(api, `${controller}.${method}`, type);
    };
  }

  configWillLoad() {
    // Ready to call configDidLoad,
    // Config, plugin files are referred,
    // this is the last chance to modify the config.
  }

  configDidLoad() {

    // Config, plugin files have been loaded.
  }

  async didLoad() {
    this.webServlet.forEach((item) => {
      this.app[item.type](item.api, item.method);
    });

    // // 处理用户信息
    // this.app.passport.verify(async (ctx, user) => {});
    // this.app.passport.serializeUser(async (ctx, user) => {});
    // this.app.passport.deserializeUser(async (ctx, user) => {});
    // All files have loaded, start plugin here.
  }

  async willReady() {

    // All plugins have started, can do some thing before app ready
  }

  async didReady() {
    // Worker is ready, can do some things
    // don't need to block the app boot.
  }

  async serverDidReady() {
    // Server is listening.
  }

  async beforeClose() {
    // Do some thing before app close.
  }
}

module.exports = AppBootHook;
