import mapValues from './mapValues';
// export default function createRoute({ models = {}, ...ctx }) {
//   return (req) => {
//     const { e403, e400 } = ctx.errors;
//     const params = req.allParams();
//     if (params.model === 'model') {
//       return _.mapValues(models, (model) => {
//         return model.universalActions || [];
//         // return Object.values(model.universalMethods || {});
//       });
//     }
//     // console.log(req, params, req.data);
//     if (!params.action) throw e400('!params.action');
//     if (!params.model) throw e400('!params.model');
//     if (!models[params.model]) throw e400('!models[params.model]');
//     const universalActions = models[params.model].universalActions || [];
//     if (universalActions.indexOf(params.action) === -1) {
//       throw e403(`Action ${params.model}.${params.action} is not available on client`);
//     }
//     let args;
//     try {
//       const paramsArgs = params.arguments || params.args;
//       if (!Array.isArray(paramsArgs)) {
//         args = JSON.parse(paramsArgs);
//       }
//       if (!Array.isArray(args)) args = [];
//     } catch (err) {
//       args = [];
//     }
//
//
//
//     if (!models[params.model][params.action]) throw e400('!models[params.model][params.action]');
//
//
//     if (params.socket && req.socket) {
//       models[params.model][params.action](req, socket)
//     }
//     //
//     // if (params.instance)
//     //
//
//
//     return models[params.model][params.action](...args);
//   };
// }
//
//


export default ({ models = {}, ctx }) => {
  // const namespace = io.of('/universal');
  // io.atachMiddlwares(namespace);
  return (namespace) => {
    namespace.on('connection', async (socket) => {
      const req = socket.request;
      // //
      // //
      const { e403, e400 } = ctx.errors;
      const params = req.data;
      if (params.model === 'model') {
        return mapValues(models, (model) => {
          return model.universalActions || [];
          // return Object.values(model.universalMethods || {});
        });
      }
      // console.log(req, params, req.data);
      if (!params.action) throw e400('!params.action');
      if (!params.model) throw e400('!params.model');
      if (!models[params.model]) throw e400('!models[params.model]');
      const universalActions = models[params.model].universalActions || [];
      if (universalActions.indexOf(params.action) === -1) {
        throw e403(`Action ${params.model}.${params.action} is not available on client`);
      }
      let args;
      try {
        const paramsArgs = params.arguments || params.args;
        if (!Array.isArray(paramsArgs)) {
          args = JSON.parse(paramsArgs);
        }
        if (!Array.isArray(args)) args = [];
      } catch (err) {
        args = [];
      }
      if (!models[params.model][params.action]) throw e400('!models[params.model][params.action]');
      models[params.model][params.action](req, socket);

      // if (params.socket && req.socket) {
      // }
      //
      // if (params.instance)
      //


      // return models[params.model][params.action](...args);
      //
      //
      // socket.join(`user_${socket.user.id}`);
      // socket.on('message', async (params) => {
      //   if (!params.text || !params.to) {
      //     return null;
      //   }
      //   const message = await Message.create({
      //     fromUserId: socket.user.id,
      //     toUserId: params.to,
      //     text: params.text,
      //     files: params.files || null,
      //   });
      //   namespace.to(`user_${params.to}`).emit('message', message);
      //   return message;
      // });
      // // socket.on('getStory', () => Promise.resolve('returned a promise'));
      // socket.on('getStory', async (params) => {
      //   const userId = socket.user.id;
      //   const opponentId = params.userId;
      //   // return Promise.resolve('returned a promise')
      //   return Message.findAll({
      //     where: {
      //       $or: [
      //         {
      //           fromUserId: userId,
      //           toUserId: opponentId,
      //         },
      //         {
      //           fromUserId: opponentId,
      //           toUserId: userId,
      //         },
      //       ],
      //     },
      //   });
      // });
    });
  };
};
