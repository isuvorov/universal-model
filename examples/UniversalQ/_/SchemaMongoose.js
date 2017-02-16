import mongoose from 'mongoose'
import Schema from './Schema'

export default class SchemaMongoose extends Schema {

  generateMongooseName(name = 'Model') {
    return name + '_' + Date.now()
  }

  getMongooseSchema() {
    const schema = new mongoose.Schema(this.schema, this.options)
    schema.statics = this.statics
    schema.methods = this.methods
    _.forEach(this.preMethods, (val, key) => {
      schema.pre(key, val)
    })
    _.forEach(this.postMethods, (val, key) => {
      schema.post(key, val)
    })
    _.forEach(this.virtuals, ([args1, method, args2]) => {
      console.log('virtuals', method, args1);
      if (method == 'init') {
        schema.virtual(...args1)
      } else {
        schema.virtual(...args1)[method](...args2)
      }
    })
    _.forEach(this.indexes, (args) => {
      schema.index(...args)
    })
    return schema
  }

}
