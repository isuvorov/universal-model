import Router from './Router';
import UniversalModel from './UniversalModel';
export default class UniversalDocument extends UniversalModel {  // UniversalModel
  constructor(params) {
    this.id = params.id;
    this.params = params;
    this.wrap = (action) => {
      return super.wrap(action, {
        id: params.id,
      });
    };
    // this.universalMethods.forEach(metod => {
    //   this.rmethod = this.wrap(method)
    // })
  }
  // static getDocument(params) {
  //   return new this.constructor(params)
  // }
  // server
  // setAndSaveAvatar(avatar) {
  //   this.model.avatar = avatar;
  //   return this.model.save()
  // }
}
