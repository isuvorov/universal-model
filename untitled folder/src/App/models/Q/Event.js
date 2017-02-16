export function getSchema(ctx) {
  const mongoose = ctx.db;
  const { e404, e500 } = ctx.errors;
  const reportTimeDifferent = 4 * 60 * 60 * 1000;
  const schema = new mongoose.Schema({
    language: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  }, {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });

  schema.methods.setDescription = async (description) => {
    this.description = description;
  };
  schema.methods.setLat = async (lat) => {
    this.lat = lat;
  };
  schema.methods.setLng = async (lng) => {
    this.lng = lng;
  };
  schema.statics.getLanguages = () => {
    return ['ru', 'en', 'ge'];
  };

  return schema;
}

export default(ctx) => {
  return ctx.db.model('Q', getSchema(ctx), 'q');
};
