import _ from 'lodash';
export default function createRoute({ models = {}, ...ctx }) {
  return (req) => {
    const { e403, e400 } = ctx.errors;
    const params = req.allParams();
    if (params.model === 'model') {
      return _.mapValues(models, (model) => {
        return model.universalActions || [];
        // return Object.values(model.universalMethods || {});
      });
    }
    // console.log(req, params, req.data);
    if (!params.action) throw e400('!params.action');
    if (!params.model) throw e400('!params.model');
    if (!models[params.model]) throw e400(`!models[${params.model}]`);
    const universalActions = models[params.model].universalActions || [];
    if (universalActions.indexOf(params.action) === -1) {
      throw e403(`Action ${params.model}.${params.action} is not available on client`);
    }
    let args;
    try {
      const paramsArgs = params.arguments || params.args;
      console.log({paramsArgs});
      if (!Array.isArray(paramsArgs)) {
        args = JSON.parse(paramsArgs);
      }
      console.log({args});
      if (!Array.isArray(args)) args = [];
    } catch (err) {
      args = [];
    }



    if (!models[params.model][params.action]) throw e400('!models[params.model][params.action]');


    if (params.socket && req.socket) {
      models[params.model][params.action](req, socket)
    }
    //
    // if (params.instance)
    //


    return models[params.model][params.action](...args);
  };
}
