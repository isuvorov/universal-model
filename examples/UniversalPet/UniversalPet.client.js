import Api from '../api/api.client'
import UniversalPet from './UniversalPet'
export default class UniversalPetClient extends UniversalPet {
  static apiUrl = '/api/v3/tests/pets'
  constructor() {
    super()
    // this.api = new Api({ base: '/api/v3/pets' })
    // console.log(this)
    // this.setAsyncActions(['findAll2']);
  }
  // static find() {
  //   return this.wrap('find')(...arguments);
  // }
  // static findAll() {
  //   return this.wrap('findAll')(...arguments);
  // }
}

UniversalPetClient.findAll = UniversalPetClient.wrap('findAll')
UniversalPetClient.findAll2 = UniversalPetClient.wrap('findAll2')
