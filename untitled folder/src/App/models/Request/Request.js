import getPlacesApi from '../../api/v1/place/place.api'
import UniversalSchema from 'lego-starter-kit/utils/UniversalSchema'
export function getSchema(ctx) {
  const mongoose = ctx.db
  const { e404 } = ctx.errors
  const placesApi = getPlacesApi(ctx)
  const schema = new UniversalSchema({
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
    place: {
      type: Object,
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
      default: null,
    },
    help: {
      required: true,
      type: String,
      enum: ['help_me', 'help_you'],
    },
    startDate: {
      // required: true,
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'REVIEW', 'ACCEPTED', 'REJECTED',
      ],
      default: 'REVIEW',
    },
    lastMessage: {
      type: String,
      default: '',
    },
  }, {
    collection: 'request',
    timestamps: true,
    discriminatorKey: '_type',
  })
  schema.methods.toJSON = function() {
    const request = this.toObject()
    request.id = request._id
    if (request.place && request.place.address) {
      request.address = request.place.address
    } else {
      request.address = ''
    }
    request.created = request.createdAt
    request.lastMessage = ''
    request.isOnline = true
    delete request._id
    delete request.__v
    return request
    // return _.omit(this.toObject(), ['password'])
  }

  schema.methods.isParticipant = function(profileId) {
    let result = false
    if (this.from == profileId) {
      result = true
    }
    if (this.to == profileId) {
      result = true
    }
    return result
  }

  schema.methods.toJsonForFuture = function(profileId) {
    const request = this.toJSON()
    if (request.from && request.from._id && request.from._id.toString() != profileId) {
      request.title = request.from.name
      if (request.from.avatar[0] === '/') {
        request.coverImage = `${ctx.config.protocol}://${ctx.config.host + request.from.avatar}`
      } else {
        request.coverImage = request.from.avatar
      }
      request.language = request.from.nativeLanguage
    } else {
      request.title = request.to.name
      if (request.to.avatar[0] === '/') {
        request.coverImage = `${ctx.config.protocol}://${ctx.config.host + request.to.avatar}`
      } else {
        request.coverImage = request.to.avatar
      }
      request.language = request.to.nativeLanguage
    }
    if (request.place && request.place.address) {
      request.place = request.place.address
    } else {
      request.place = ''
    }

    request.description = 'Личная встреча'

    request.isOnline = true
    request.owner = this.from._id
    return request
  }
  schema.methods.toJsonForAllFutures = function(profileId) {
    const request = this.toJSON()
    if (request.from && request.from._id && request.from._id.toString() != profileId) {
      request.title = request.from.name
      if (request.from.avatar[0] === '/') {
        request.coverImage = `${ctx.config.protocol}://${ctx.config.host + request.from.avatar}`
      } else {
        request.coverImage = request.from.avatar
      }
      request.isOnline = request.from.isOnline || false
      request.language = request.from.nativeLanguage
    } else {
      request.title = request.to.name
      if (request.to.avatar[0] === '/') {
        request.coverImage = `${ctx.config.protocol}://${ctx.config.host + request.to.avatar}`
      } else {
        request.coverImage = request.to.avatar
      }
      request.isOnline = request.to.isOnline || false
      request.language = request.to.nativeLanguage
    }
    return request
  }

  schema.methods.toJsonForProfile = function(profileId) {
    const request = this.toJSON()
    if (request.from && request.from._id && request.from._id !== profileId) {
      request.firstName = request.from.firstName
      request.lastName = request.from.lastName
      request.avatar = request.from.avatar
      request.profile = request.from._id
      request.language = request.from.nativeLanguage
      if (request.from && request.from.avatar) {
        if (request.from.avatar[0] === '/') {
          request.avatar = `${ctx.config.protocol}://${ctx.config.host + request.from.avatar}`
        } else {
          request.avatar = request.from.avatar
        }
      }
    } else {
      request.firstName = request.to.firstName
      request.lastName = request.to.lastName
      request.avatar = request.to.avatar
      request.profile = request.to._id
      request.language = request.to.nativeLanguage
      if (request.from && request.from.avatar) {
        if (request.from.avatar[0] === '/') {
          request.avatar = `${ctx.config.protocol}://${ctx.config.host + request.from.avatar}`
        } else {
          request.avatar = request.from.avatar
        }
      }
    }
    // delete request.place
    return request
  }

  schema.methods._confirm = async function() {
    this.status = 'ACCEPTED'
  }

  schema.methods._reject = async function() {
    this.status = 'REJECTED'
  }
  schema.methods.getTimezone = async function() {
    return ctx.services.GoogleMaps.getTimezone(this.startDate)
  }
  schema.methods.getLocalTime = async function() {
    const timezone = await this.getTimezone()
    return ctx.services.GoogleMaps.getDateByTimezone(this.startDate, timezone)
  }
  // // Отклонить приглашение
  // schema.methods.reject = async function () {
  //   return 123
  // }
  // СТАТИКА
  schema.statics.checkNotFound = async function(requestId) {
    if (!requestId) {
      throw e404('requestId is not found')
    }
    const request = await this.findById(requestId)
    if (!request) {
      throw e404(`request with id = ${requestId} is not found`)
    }
    return request
  }
  // // СОЗДАТЬ ВСТРЕЧУ
  schema.statics.add = async function(params) {
    const { Request } = ctx.models
    if (!params) {
      throw e404('request params is not found')
    }
    const requestFields = ['from', 'to', 'place', 'help', 'startDate']

    for (const field of requestFields) {
      if (params[field] !== false && !params[field]) {
        throw e404(`${field} is not found`)
      }
    }
    if (params.to === params.from) {
      throw e404('You can not send themselves')
    }
    return new Request(params).save()
  }

  schema.statics.getList = async function(profileId) {
    const {Profile} = ctx.models
    const profile = await Profile.check(profileId)

    const requests = await this.find({
      $or: [
        {
          to: profile._id
        }, {
          from: profile._id
        }
      ]
    })
    return requests
  }

  schema.statics.getProfileFavorites = async function(profileId) {
    const {Profile} = ctx.models
    await Profile.check(profileId)

    const requests = await this.find({
      $or: [
        {
          to: profileId
        }, {
          from: profileId
        }
      ]
    }).populate('from').populate('to')

    const favorites = []
    for (const request of requests) {
      if (request.from._id != profileId) {
        favorites.push(request.from)
      }
      if (request.to._id != profileId) {
        favorites.push(request.to)
      }
    }
    return favorites
  }

  schema.pre('save', function (next) {
    if (typeof this.place === 'string') {
      placesApi.get(this.place)
      .then(_place => {
        if (_place) {
          this.place = _place
        }
        return next()
      })
    } else {
      return next()
    }
  })

  return schema
}

export default(ctx) => {
  return ctx.db.model('Request', getSchema(ctx).getMongooseSchema())
}
