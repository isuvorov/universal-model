import fetch from 'isomorphic-fetch';
import Api from '../api/api.client';
export default class UniversalModelClient {
  constructor() {
    this.api = new Api({ base: '/api/v3' });
    console.log(this.api);
  }
  async find() {
    console.log(window);
    console.log(this);
    return {
      method: 'find',
      result: await this.api.fetch('/tests'),
    };
  }
}
