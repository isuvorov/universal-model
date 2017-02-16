import { getSchema } from './Abuse'
export function getAbuseProfileSchema(ctx) {
  const mongoose = ctx.db
  const abuseSchema = getSchema(ctx)
  const schema = abuseSchema.extend({
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', //ctx.models.getName()
    },
  });
  return schema
}

export default(ctx) => {
  const schema = getAbuseProfileSchema(ctx)
  return ctx.db.model('AbuseProfile', schema)
}
