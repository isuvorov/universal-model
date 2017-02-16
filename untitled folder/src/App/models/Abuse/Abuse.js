import _ from 'lodash'
export function getSchema(ctx) {
  const mongoose = ctx.db
  const schema = new mongoose.Schema({
    text: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', //ctx.models.getName()
    },
  }, {
    collection: 'abuse',
    timestamps: true,
    discriminatorKey: '_type',
  })

  schema.methods.toJSON = function toJSON() {
    const abuse = this.toObject()
    abuse.id = abuse._id
    return _.omit(abuse, ['_id', '__v'])
  }

  return schema
}

export default(ctx) => {
  const schema = getSchema(ctx)
  return ctx.db.model('Abuse', schema)
}
