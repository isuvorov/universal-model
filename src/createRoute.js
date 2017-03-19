import mapValues from './mapValues';

function log(...args) {
  if (process.env.DEBUG) console.log(...args); // eslint-disable-line
}

// /log('universal-model init');
export default function createRoute({ models = {}, ...ctx }) {
  log('createRoute init');
  return (req) => {
    log('createRouter run');
    const { e403, e400 } = ctx.errors;
    const params = Object.assign({}, req.query, req.body);
    // /log('params', params, req.allParams());

    if (params.model === 'model') {
      return mapValues(models, (model) => {
        return model.universalActions || [];
        // return Object.values(model.universalMethods || {});
      });
    }
    // /// log(req, params, req.data);
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
      // /log({paramsArgs});
      if (!Array.isArray(paramsArgs)) {
        args = JSON.parse(paramsArgs);
      } else {
        args = paramsArgs;
      }
      // /log({args});
      if (!Array.isArray(args)) {
        throw 'incorrect args';
      }
    } catch (err) {
      log('universal-model getargs error', err);
      args = [];
    }


    if (!models[params.model][params.action]) throw e400('!models[params.model][params.action]');


    if (params.socket && req.socket) {
      log(`WS umodels[${params.model}].${params.action}()`);
      models[params.model][params.action](req, req.socket);
    }
    //
    // if (params.instance)
    //

    log(`GET umodels[${params.model}].${params.action}(${args.map(a => JSON.stringify(a)).join(',')})`);
    return models[params.model][params.action](...args);
  };
}
