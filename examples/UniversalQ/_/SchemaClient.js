// import Schema from './Schema'
//
// //////
// ///
// const userModel = new UserModel()
// userModel.phone =  'qweqweqw'
// userModel.fill({
//   username: 'asdasdas'
// })
// userModel.validate() // client
// userModel.serverValidate() // RPC
// userModel.save() // RPC
//
//
// //server
// params = {
//   username, password
// }
// const userModel = new UserModel()
// userModel.fill(params)
// userModel.validate()
// userModel.save()
//
// //////
// ///
// ///
// findOne()
//
// // POST  /api/rpc
// // method = findOne
// // model = Pet
// // {
// // name
// // }
// => DB => JSON
//
// return PetModel(JSON, Pet.options)
//
//
//
// const pet = Pet.findOne({ // RPC
//   name: 'isuvorov'
// })
// pet.name = 'qweqweqwe'
// pet.age = 123
// pet.recountColor() // common
// pet.specific() // client.js
// pet.save() // RPC
// // POST
// // /api/rpc
// // id= 123123123
// // model = PET
// // {
// // name, age
// // }
//
//
// //server
// const pet = Pet.findOne({
//   name: 'isuvorov'
// })
// pet.name = 'qweqweqwe'
// pet.age = 123
// pet.recountColor()  // common
// pet.specific() // server.js
// pet.saveAvatar(file) // only server method
// pet.save()
// ////////
//
// //  Контроллер
//
// class Some {
//   method() {
//
//   }
// }
//
// ////
//
// await ApiV1.authSignup(userModel)
//
// export default class SchemaMongoose extends Schema {
//
//   getClientModel(apiClient) {
//
//     .asdasd
//     return {
//
//     }
//
//   }
//
// }
