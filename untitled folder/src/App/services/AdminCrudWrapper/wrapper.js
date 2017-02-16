import asyncRouter from 'lego-starter-kit/utils/AsyncRouter';
export default ctx => (Model, params = {}) => {
  const { checkNotFound } = ctx.helpers;
  const api = params.api || asyncRouter();
  const prefix = params.prefix || '';
  const middleware = params.middleware || function () {};
  api.get(`${prefix}/`, middleware, async (req) => {
    const params = req.allParams();
    const { populate } = params;
    let mongooseQuery = Model.find();
    if (populate) {
      mongooseQuery = mongooseQuery.populate(populate);
    }
    return mongooseQuery;
  });
  api.get(`${prefix}/:id`, middleware, async (req) => {
    const params = req.allParams();
    const { populate = '' } = params;
    let mongooseQuery = Model
    .findById(params.id);
    const populates = populate.split(',');
    populates.map((p) => {
      mongooseQuery = mongooseQuery.populate(p);
    });
    return mongooseQuery;
  });
  api.post(`${prefix}/`, middleware, async (req) => {
    const doc = new Model(req.allParams());
    return doc.save();
  });
  api.put(`${prefix}/:id`, middleware, async (req) => {
    const params = req.allParams();
    const doc = await Model.findById(params.id);
    Object.assign(doc, params);
    return doc.save();
  });
  api.delete(`${prefix}/:id`, middleware, async (req) => {
    const doc = await Model
    .findById(req.allParams().id)
    .then(checkNotFound);
    return doc.remove();
  });
  return api;
};
