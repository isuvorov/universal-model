import UniversalModel from '../UniversalModel'

class Model {

}

export default class UniversalPet extends UniversalModel {
  isOdd() {
    return this.age % 2;
  }

  static async getOddPets() {
    return this.findAll().filter(p => p.age % 2);
    // return this.findAll().filter(p => p.isOdd());
  }
}
// UniversalPet.findAll = UniversalPet.bindServer('findAll')
