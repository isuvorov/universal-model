import Router from './Router';
export default class UniversalModel { // universaltransport
  static universalMethods = []
  static init({ api }) {
    this.api = api;
    this.universalMethods.forEach((method) => {
      this[method] = this.wrap(method);
    });
  }
  static wrap(action, params) {
    return async function () {
      const pack = await this.api.fetch('/', {
        method: 'POST',
        body: { model: this.universalName, action, arguments, ...params },
      });
      if (pack.err) {
        // ??
      }
      return pack.data;
    };
  }



  static getRouter = Router
}
