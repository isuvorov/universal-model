import UniversalModel from '../UniversalModel';
export default class UniversalCounter extends UniversalModel {
  static universalName = 'UniversalCounter'
  static universalMethods = ['get', 'increment']
}
