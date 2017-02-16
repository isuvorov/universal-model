import UniversalCounter from './UniversalCounter';
import Q from '../models/Q';
export default class UniversalCounterServer extends UniversalCounter {
  static model = Q

  // позитивные атдейты
  // date
  static counter = 10;
  static async get() {
    return this.counter;
  }
  static async increment() {
    this.counter += 1;

    /// server lag 10s
    return this.counter;
  }

  // позитивные атдейты
  // date
  static counter = new Date();
  static async get() {
    return this.counter;
  }
  static async increment() {
    this.counter = this.counter.tomorrow();

    /// server lag 10s
    return this.counter;
  }
}
