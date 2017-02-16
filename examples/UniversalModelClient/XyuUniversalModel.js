import UniversalModel from '../UniversalModel';
import fetch from 'isomorphic-fetch';
import fs from 'fs';
export default class XyuUniversalModel extends UniversalModel {
  static async fetch(url) {
    try {
      const response = await fetch(url);
      const json = await response.json();
      return json;
    } catch (err) {
      return err;
    }
  }
  static async find() {
    if (__CLIENT__) {
      return {
        method: 'find',
        result: await this.fetch('/api/v3/tests'),
      };
    } else {
      return fs.readFileSync('${__dirname}/../xxx.json');
    }
  }
}
