import UniversalCounter from './UniversalCounter';
import Q from '../models/Q';
export default class UniversalQServer extends UniversalCounter {
  static model = Q
}
UniversalQServer.statics = Q.statics
UniversalQServer.methods = Q.methods
