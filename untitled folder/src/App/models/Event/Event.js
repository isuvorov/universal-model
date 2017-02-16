export function getSchema(ctx) {
  const mongoose = ctx.db;
  const { e404, e500 } = ctx.errors;
  const reportTimeDifferent = 4 * 60 * 60 * 1000;
  const schema = new mongoose.Schema({
    language: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', //ctx.models.getName()
    },
    coverImage: {
      type: String,
      default: '/static/event_background.jpg',
    },
    place: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      address: {
        type: String,
      },
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
      photo: {
        type: String,
        default: '',
      },
      price: {
        type: Number,
        default: 0,
      },
    },
    lastMessage: {
      type: String,
      default: '',
    },
    loc: {
      type: [Number],
      index: '2dsphere',
      default: null,
    },
    status: {
      type: String,
      enum: ['PRIVATE', 'PUBLIC', 'REJECTED'],
      default: 'PUBLIC',
      uppercase: true,
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile', //ctx.models.getName()
      },
    ],
  }, {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });

  schema.virtual('lng').get(function () {
    if (this.loc && this.loc[0]) return this.loc[0];
    if (this.place && this.place.lng) return this.place.lng;
    return null;
  });
  schema.virtual('lat').get(function () {
    if (this.loc && this.loc[1]) return this.loc[1];
    if (this.place && this.place.lat) return this.place.lat;
    return null;
  });

  schema.pre('save', function (next) {
    if (this.coverImage.indexOf('?timestamps=') === -1) {
      this.coverImage = `${this.coverImage}?timestamps=${new Date().getTime()}`;
    }
    if (this.place.lng && this.place.lat) {
      this.loc = [this.place.lng, this.place.lat];
    }
    if (this.isModified('startDate')) {
      this.createScheduleReport();
    }
    return next();
  });

  schema.methods.toJSON = function () {
    const event = this.toObject();
    event.id = event._id;
    if (event.coverImage[0] === '/') {
      event.coverImage = `${ctx.config.protocol}://${ctx.config.host}${event.coverImage}`;
    }
    if (!event.lastMessage) event.lastMessage = '';
    delete event._id;
    delete event.__v;
    return event;
  };

  schema.methods.toJsonForFutures = function () {
    const event = this.toJSON();
    let place = '';
    if (event.place && event.place.address) {
      place = event.place.address;
    }
    event.place = place;
    return event;
  };
  // schema.plugin(ctx.mongooseRenameId({newIdName: 'id'}));

  schema.methods.participantsToJSON = async function () {
    const { Profile } = ctx.models;
    const participants = [];
    for (const participant of this.participants) {
      const profileId = participant._id || participant;
      const profile = await Profile.findById(profileId);
      if (profile) {
        participants.push(profile.toJSON());
      }
    }
    return participants;
  };

  schema.methods.createScheduleReport = async function createScheduleReport() {
    const title = `event_${this._id}`;
    const date = new Date(new Date(this.startDate) - reportTimeDifferent);
    const currentDate = new Date();
    const { startDate } = this;
    if (currentDate > date && currentDate - date < reportTimeDifferent) {
      return this.reportBeforeStart();
    }
    return ctx.Schedule.add(title, date, () => this.reportBeforeStart());
  };

  schema.methods.reportBeforeStart = async function () {
    const profiles = await this.findNearestUsers(ctx.config.logic.events.beforeStart);
    let owner = this.owner;
    if (this.owner && this.owner._id) {
      owner = this.owner._id;
    }
    owner = owner.toString();
    const promises = profiles.map((profile) => {
      if (!profile || !profile.notify || !profile._id) {
        return null;
      }
      if (owner === profile._id) {
        return null;
      }
      profile.notify('msg19', {
        event: this,
        eventId: this._id.toString(),
      });
      profile.notifyEmail('group_meeting', {
        event: this.toJSON(),
      });
      return true;
    });
    return Promise.all(promises);
  };

  schema.methods.isParticipant = function (profileId) {
    let result = false;
    this.participants.forEach((participant) => {
      if (participant == profileId || participant._id == profileId) {
        result = true;
      }
    });
    return result;
  };

  schema.methods.isWantVisit = function (profileId) {
    if (this.participants.indexOf(profileId) === -1) return false;
    return true;
  };

  schema.methods.profileIsVisited = function (profileId) {
    let result = true;
    if (this.participants.indexOf(profileId.toString()) === -1) {
      this.participants.push(profileId);
      result = false;
    }
    return result;
  };


  schema.methods.addParticipant = async function (profileId) {
    if (profileId == null) return this;
    const Profile = ctx.models.Profile;
    const { checkNotFound } = ctx.helpers;
    Profile.findById(profileId).then(checkNotFound);

    if (this.participants.indexOf(profileId) === -1) {
      this.participants.push(profileId);
    }
    return this;
  };

  schema.methods.getTimezone = async function () {
    // console.log(this.lat, this.lng)
    return ctx.services.GoogleMaps.getTimezone(this.lat, this.lng);
  };
  schema.methods.getLocalTime = async function () {
    const timezone = await this.getTimezone();
    return ctx.services.GoogleMaps.getDateByTimezone(this.startDate, timezone);
  };

  schema.methods.removeParticipant = async function (profileId) {
    if (this.participants.indexOf(profileId) !== -1) {
      this.participants = this.participants.filter(v => v !== profileId);
    }
  };

  schema.methods.findNearestUsers = async function (distance = 50, findParams) {
    if (!this.loc || !this.loc[0] === undefined || !this.loc[1] === undefined) {
      return [];
    }
    const { Profile } = ctx.models;
    const query = {
      deleted: false,
    };
    query.loc = {
      $near: {
        $maxDistance: distance * 1000,
        $geometry: {
          type: 'Point',
          coordinates: this.loc,
        },
      },
    };
    if (typeof (findParams) === 'object') {
      Object.assign(query, findParams);
    }
    return Profile.find(query);
  };

  schema.statics.reportNearEvents = async function () {
    const currentDate = new Date();
    const timeToStart = 4 * 60 * 60 * 1000;
    const params = {
      timeToStart,
      minStartDate: currentDate,
      maxStartDate: new Date(currentDate.getTime() + timeToStart),
    };
    const events = await this.find({
      status: {
        $ne: 'REJECTED',
      },
      startDate: {
        $gte: params.minStartDate,
        $lte: params.maxStartDate,
      },
    });
    events.forEach((event) => {
      return event.reportBeforeStart();
    });
  };

  schema.statics.getList = async function (params) {
    if (params.lang) {
      params.language = params.lang //eslint-disable-line
      delete params['lang'] //eslint-disable-line
    }
    return this.find(params);
  };

  schema.statics.getFutures = async function () {
    const currentDate = new Date();
    const { startDateTimeout } = ctx.config.logic.events;
    return this.find({
      startDate: {
        $gte: currentDate - startDateTimeout,
      },
    });
  };

  schema.statics.get = async function (eventId) {
    const event = await this.findById(eventId).populate('participants');
    return event;
  };

  return schema;
}

export default(ctx) => {
  return ctx.db.model('Events', getSchema(ctx), 'events');
};
