import forEach from 'lodash/forEach'
const _ = { forEach }

const defaultParams = {
  filter: {},
  sort: {},
  limit: 20,
  populate: [],
}
const defaultOptions = {
  timestamps: true,
}

export default class Schema {
  constructor(schema = {}, options = {}) {
    this.schema = schema
    this.options = Object.assign({}, defaultOptions, options)
    this.statics = {
      findByParams(incomeParams) {
        const params = Object.assign({}, defaultParams, incomeParams);
        return this.find(params.filter)
        .sort(params.sort)
        .limit(params.limit)
      },
    }
    this.methods = {}
    this.preMethods = {}
    this.postMethods = {}
    this.indexes = []
    this.virtuals = []
    // this.indexes = {}
  }

  extend(schema, options) {
    const object = new UniversalSchema()
    const fields = ['schema', 'options', 'statics', 'methods', 'preMethods', 'postMethods']
    fields.forEach(key => {
      object[key] = Object.assign({}, this[key])
    })
    Object.assign(object.schema, schema)
    Object.assign(object.options, options)
    return object
  }

  pre(key, val) {
    this.preMethods[key] = val
  }

  post(key, val) {
    this.postMethods[key] = val
  }

  virtual(...args1) {
    if(args1.length > 1) {
      this.virtuals.push([args1, 'init']);
    }
    return {
      set: (...args2) => {
        this.virtuals.push([args1, 'set', args2]);
      },
      get: (...args2) => {
        this.virtuals.push([args1, 'get', args2]);
      },
    }
  }
  index(...args) {
    this.indexes.push(args)
  }

}
