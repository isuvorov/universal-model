import { getSchema } from './Abuse'
export function getAbuseEventSchema(ctx) {
  const mongoose = ctx.db
  const abuseSchema = getSchema(ctx)
  const schema = abuseSchema.extend({
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event', //ctx.models.getName()
    },
  });
  return schema
}

export default(ctx) => {
  const schema = getAbuseEventSchema(ctx)
  return ctx.db.model('AbuseEvent', schema)
}
