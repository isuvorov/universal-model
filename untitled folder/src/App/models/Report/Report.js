import _ from 'lodash';
export function getSchema(ctx) {
  const mongoose = ctx.db;
  const schema = new mongoose.Schema({
    profileId: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    logs: {
      type: Object,
    },
  }, {
    collection: 'report',
    timestamps: true,
  });

  schema.methods.toJSON = function toJSON() {
    const abuse = this.toObject();
    abuse.id = abuse._id;
    return _.omit(abuse, ['_id', '__v']);
  };

  schema.statics.getReplyMessage = function (language) {
    let message;
    switch (language) {
      case 'ru':
        message = 'Спасибо за репорт, мы свяжемся с вами.';
        break;
      default:
        message = 'Thank you for your report, we will contact you.';
        break;
    }
    return message;
  };

  return schema;
}

export default(ctx) => {
  const schema = getSchema(ctx);
  return ctx.db.model('Report', schema);
};
