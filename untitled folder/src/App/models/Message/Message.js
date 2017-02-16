import PubNub from 'pubnub'
let pubNub = null
export function getSchema(ctx) {
  const mongoose = ctx.db
  const { e400, e500 } = ctx.errors
  const schema = new mongoose.Schema({
    from: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', // ctx.models.getName()
    },
    to: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile', // ctx.models.getName()
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['READ', 'UNREAD'],
      default: 'UNREAD',
    },
  }, {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  })

  schema.virtual('id').get(function () {
    return this._id
  });

  schema.pre('save', async function (done) {
    if (this.isNew) {
      const [to, from] = await Promise.all([
        ctx.models.Profile.findById(this.to),
        ctx.models.Profile.findById(this.from),
      ])
      if (!to || !from) {
        return done()
      }
      try {
        const message = this
        message.id = this._id
        to.lastMessageObject = message
        // PUSH BEGIN
        to.notify('msg9', {
          fromProfile: from,
          fromProfileId: from.id,
          message,
        })
        from.readAllMessagesFromProfile(to.id)
        // PUSH END
        return done()
      } catch (err) {
        return done()
      }
    } else {
      return done()
    }
  })

  schema.statics.pubNubInit = function () {
    const { Profile } = ctx.models
    const { publishKey, subscribeKey, secretKey, channel } = ctx.config.pubnub
    pubNub = new PubNub({
      publishKey, subscribeKey, secretKey,
    })
    pubNub.addListener({
      status: (statusEvent) => {
        console.log({ statusEvent })
      },
      presence: (presenceEvent) => {
        console.log({ presenceEvent })
      },
      message: async (m) => {
        try {
          // console.log(m)
          const { message } = m
          const { from, text } = message
          let to = null
          if (message.to && message.to.indexOf('.') >= 0) {
            to = message.to.split('.')[1]
          } else {
            to = message.to
          }
          if (from && to) {
            const [fromProfile, toProfile] = await Promise.all([
              Profile.findById(from),
              Profile.findById(to),
            ])
            if (!fromProfile) {
              throw e500(`user with id = ${from} is not found`)
            }
            if (!toProfile) {
              throw e500(`user with id = ${to} is not found`)
            }
          } else {
            if (!from) {
              throw e400('!from')
            }
            if (!to) {
              throw e400('!to')
            }
          }
          const _message = new this({
            from, to, text,
          })
          return _message.save()
        } catch (err) {
          console.error(err)
          return err
        }
      },
    })
    console.log({ channel })
    pubNub.subscribe({
      channels: ['users.*'],
    });
  }

  schema.statics.publish = (message) => {
    const { channel } = ctx.config.pubnub
    try {
      const channelName = `${channel.split('.')[0]}.${message.from}-${message.to}`
      return pubNub.publish({
        channel: channelName,
        message,
      })
    } catch (err) {
      return null
    }
  }

  return schema
}

export default(ctx) => (ctx.db.model('Message', getSchema(ctx), 'message'))
