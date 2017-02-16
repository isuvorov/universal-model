import UniversalSchema from 'lego-starter-kit/utils/UniversalSchema'
import { getSchema as getRequestSchema} from '../../Request'
export function getSchema(ctx) {
  const mongoose = ctx.db
  const requestSchema = getRequestSchema(ctx)
  const schema = requestSchema.extend({
    reviewer: {
      // required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', // ctx.models.getName()
    },
    sender: {
      // required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', // ctx.models.getName()
    },
  })
  return schema
}

export default(ctx) => {
  return ctx.db.model('RequestV2', getSchema(ctx).getMongooseSchema())
}
