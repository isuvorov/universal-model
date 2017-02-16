import fs from 'fs';
export default class UniversalModelServer {
  async find() {
    return {
      method: 'find',
      result: JSON.parse(fs.readFileSync(`${__dirname}/../xxx.json`)),
    };
  }
}
