import { doClientRequest, createClientAction, connectAction, transform, transformArray } from 'universal-model';

// const mongooseCollectionMethods = [
//     'find'
//   , 'findOne'
//   , 'update'
//   , 'updateMany',
//   , 'updateOne'
//   , 'remove'
//   , 'count'
//   , 'distinct'
//   , 'findAndModify'
//   , 'aggregate'
//   , 'findStream'
// ];



// class ClassName {
//   constructor() {
//
//   }
// }

// User.getMy().asdad
// User.find({asdasd,  }).not().sort().limit().unsort()
//
//
// user.near().sort().limit()

//
// User
// Course
//
// u-c
//
// c
// // ьщтпщ
// //
// // @universal
// class UC {
//
//
//   static getCourses() {
//     return `https://hijay-dev.mgbeta.ru${this.coverImage}`;
//   }
//
//   @rpc
//   static findUser({name, qweqw}) {
//     this.find(4)
//     return `https://hijay-dev.mgbeta.ru${this.coverImage}`;
//   }
//
//   @server
//   static findUserServer({name, qweqw}) {
//
//     this.find(4)
//     return `https://hijay-dev.mgbeta.ru${this.coverImage}`;
//   }
//
//   @client
//   static findUserClient({name, qweqw}) {
//     this.find(4)
//     return `https://hijay-dev.mgbeta.ru${this.coverImage}`;
//   }
//
//   static findUser = __CLIENT__ ? this.findUserClient: this.findUserServer
//
//   @client
//   static save2(fileds){
//     this
//     this.save()
//   }
//
//
// }
//
//

// this.asdasd =123;
// this.save()

// ьщтпщ
class TaskClient {

  constructor(json) {
    Object.assign(this, json);
  }
  getImage() {
    return `https://hijay-dev.mgbeta.ru${this.coverImage}`;
  }
  startTask(param) {

    //
  }
  findBySOme(praprapra) {
    //
  }
}

const transform = (json) => {
  return new TaskClient(json);
}

const transformArray = (arr) => {
  return arr.map(transform)
}



export default (ctx) => {
  console.log('ctx.provider.api', ctx.provider.api);


  return {
    ...createClientActions({
      api: ctx.provider.api,
      model: 'task',
      action: ['getTasks', 'find'],
      format: [TaskClient],
    }),
    ...createClientActions({
      api: ctx.provider.api,
      model: 'task',
      action: ['findOne'],
      format: TaskClient,
    }),
  }

  return {
    _universal: {
      api: ctx.provider.api,
      model: 'task',
    },
    ...createClientActions({
      action: ['getTasks', 'find'],
      format: [TaskClient],
    }),
    ...createClientActions({
      action: ['findOne'],
      format: TaskClient,
    }),
  }
}};
