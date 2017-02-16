import jwt from 'jsonwebtoken'
import _ from 'lodash'
import getNotify from './notify'
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
const bcryptGenSalt = Promise.promisify(bcrypt.genSalt)
const bcryptHash = Promise.promisify(bcrypt.hash)
const bcryptCompare = Promise.promisify(bcrypt.compare)
import validator from 'validator'
import sharp from 'sharp'
import fs from 'fs'

function onlyId(data) {
  const object = {}
  if (typeof(data) === 'object') {
    const keys = Object.keys(data)
    keys.forEach(key => {
      if (typeof(data[key]) === 'object') {
        object[key] = _.pick(data[key], ['id', '_id'])
        if (object[key].id) {
          object[key].id = object[key].id.toString()
        }
        if (object[key]._id) {
          object[key]._id = object[key]._id.toString()
        }
      } else {
        object[key] = data[key]
      }
    })
  }
  // if (object.from) {
  //   object.from2 = object.from
  //   delete object.from
  // }
  return object
}
export function getSchema(ctx) {
  const mongoose = ctx.db

  const { e404, e500 } = ctx.errors

  const transporter = (ctx.config.mail && ctx.config.mail.transport)
  && Promise.promisifyAll(nodemailer.createTransport(ctx.config.mail.transport))

  const schema = new mongoose.Schema({
    firstName: {
      type: String,
      default: 'Имя',
    },
    lastName: {
      type: String,
      default: 'Фамилия',
    },
    description: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: false,
      default: null,
      validate: (email) => {
        if (email === null) return true
        return validator.isEmail(email)
      },
    },
    nativeLanguage: {
      required: true,
      type: String,
      default: 'ru',
    },
    learningLanguages: {
      type: [
        {
          type: String,
        },
      ],
      default: ['en'],
    },
    bdate: {
      required: true,
      type: Date,
      default: Date.now,
    },
    avatar: {
      type: String,
      default: '/static/default-avatar.png',
    },
    // avatars: {},
    city: {
      type: String,
      default: 'Город',
    },
    pubNub: {
      type: String,
    },
    loc: {
      type: [Number],
      index: '2dsphere',
      default: null,
    },
    futureEvents: {
      type: [
        {
          type: String,
        },
      ],
    },
    askHelp: {
      type: String,
      default: null,
    },
    offerHelp: {
      type: String,
      default: null,
    },
    chatAvailable: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    linkToSocialNetwork: {
      type: String,
      toLowerCase: true,
    },
    socialNetworkType: {
      type: String,
      enum: ['vk', 'fb', 'local'],
      toLowerCase: true,
    },
    address: {
      type: String,
    },
    lastMessageObject: {
      type: Object,
      default: null,
    },
    _lastVisitedAt: {
      type: Date,
      default: null,
    },
    password: {
      type: 'String',
      defalt: null,
    },
    newMessage: {
      type: Number,
      default: 0,
    },
    devices: [
      {
        id: String,
        type: {
          type: String,
        },
        token: String,
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
  })
  // МЕТОДЫ
  // КООРДИНАТЫ
  const notify = getNotify(ctx)
  const SALT_WORK_FACTOR = 10
  const preValidate = function (next) {
    const { isBase64 } = ctx.helpers
    const promises = []
    if (this.isModified('email')) {
      if (!validator.isEmail(this.email)) {
        this.email = null
      }
    }
    if (this.isModified('avatar') && isBase64(this.avatar)) {
      const promise = async () => {
        return this.saveAvatar()
      }
      promises.push(promise())
    }
    return Promise.all(promises).then(next)
  }
  const preSave = function (next) {
    const promises = []
    if (this.isModified('password')) {
      const promise = () => {
        return this.encryptPassword(this.password).then(password => {
          this.password = password
          return this
        })
      }
      promises.push(promise())
    }
    Promise.all(promises)
    .then(next)
  }
  schema.pre('save', preSave)
  schema.pre('update', preSave)
  schema.pre('validate', preValidate)

  schema.virtual('lastMessage').get(function () {
    if (this.lastMessageObject && this.lastMessageObject.text) {
      return this.lastMessageObject.text
    }
    return null
  });
  schema.virtual('lat').get(function () {
    if (this.loc && this.loc[1]) {
      return this.loc[1]
    }
    return null
  });
  schema.virtual('lng').get(function () {
    if (this.loc && this.loc[0]) {
      return this.loc[0]
    }
    return null
  });
  schema.virtual('name').get(function () {
    let name = ''
    if (this.firstName) name += this.firstName
    if (this.lastName) {
      if (name.length > 0) name += ' '
      name += this.lastName
    }
    return name
  });
  schema.virtual('isOnline').get(function () {
    return ctx.onlineMap.isOnline(this._id)
  });
  schema.virtual('lastVisitedAt').get(function () {
    const lastVisited = ctx.onlineMap.getLastVisited(this._id)
    if (lastVisited) {
      return lastVisited
    }
    return null
  });
  schema.virtual('avatars').get(function () {
    const { url } = ctx.config
    const avatars = {}
    if (this.avatar && this.avatar[0] !== '/') {
      avatars.original = this.avatar
    }
    if (this.avatar && this.avatar[0] === '/') {
      const path = ctx.helpers.getFilePathWithoutExtension(this.avatar)
      const ext = ctx.helpers.getFileExtensionFromPath(this.avatar)
      const timestamps = this.avatar.indexOf('?timestamps') >= 0 ? this.avatar.split('?timestamps')[1] : ''
      avatars.small = `${url}${path}_s.${ext}?${timestamps}`
      avatars.medium = `${url}${path}_m.${ext}?${timestamps}`
      // avatars.big = `${url}${path}_b.${ext}?timestamps${timestamps}`
      avatars.original = `${url}${path}_b.${ext}?${timestamps}`
    }
    return avatars
  });

  schema.methods.toJSON = function () {
    const profile = this.toObject()
    profile.id = profile._id
    profile.language = profile.nativeLanguage
    if (profile.avatar && profile.avatar[0] === '/') {
      profile.avatar = `${ctx.config.url}${profile.avatar}`
    }
    if (Array.isArray(profile.avatars)) {
      profile.avatars = profile.avatars.map(avatar => {
        return `${ctx.config.url}${avatar}`
      })
    }
    return _.omit(profile, ['_id', '__v', 'devices', '_lastVisitedAt', 'password'])
  }
  schema.methods.pick = function (fields) {
    const profile = this.toJSON()
    if (Array.isArray(fields)) {
      return _.pick(profile, fields)
    }
    return profile
  }
  //
  schema.methods.sendWelcomeEmail = async function() {
    const mailOptions = {
      subject: "Поздравляем с регистрацией в 'HiJay'",
      text: `Уважаемый ${this.name}, поздравляем с регистрацией в 'HiJay'`,
    }
    return this.sendEmail(mailOptions)
  }
  schema.methods.encryptPassword = async function(password) {
    return bcryptGenSalt(SALT_WORK_FACTOR)
    .then(salt => {
      return bcryptHash(password, salt)
    })
  }

  schema.statics.createDefaultAvatars = async function () {
    const fullPath = `${__dirname}/../src/public/default-avatar.png`
    const filePath = `${__dirname}/../src/public/default-avatar`
    const fileExt = 'jpg'
    const tasks = []
    tasks.push(() => {
      const _path = `${filePath}_s.${fileExt}`
      return sharp(fullPath)
      .resize(75)
      .quality(60)
      .progressive()
      .jpeg()
      .toFile(_path)
    })
    tasks.push(() => {
      const _path = `${filePath}_m.${fileExt}`
      return sharp(fullPath)
      .resize(240)
      .quality(60)
      .progressive()
      .jpeg()
      .toFile(_path)
    })
    tasks.push(() => {
      const _path = `${filePath}_b.${fileExt}`
      return sharp(fullPath)
      .resize(1024)
      .progressive()
      .quality(80)
      .jpeg()
      .toFile(_path)
    })

    return Promise.all(tasks.map(task => task()))
  }

  schema.methods.saveResizedAvatars = async function(file) {
    try {
      const path = this.avatar.split('?timestamps')[0]
      const fileExt = ctx.helpers.getFileExtensionFromPath(path)
      const filePath = ctx.helpers.getFilePathWithoutExtension(path)
      const fullPath = `${__dirname}/public/${path}`
      if (!file) {
        file = fs.readFileSync(fullPath)
      }
      const buffer = new Buffer(file, 'base64')
      const tasks = []
      tasks.push(() => {
        const _path = `${filePath}_s.${fileExt}`
        const _fullPath = `${__dirname}/public/${_path}`
        return sharp(buffer)
        .resize(75)
        .quality(60)
        .progressive()
        .jpeg()
        .toFile(_fullPath)
      })
      tasks.push(() => {
        const _path = `${filePath}_m.${fileExt}`
        const _fullPath = `${__dirname}/public/${_path}`
        return sharp(buffer)
        .resize(240)
        .quality(60)
        .progressive()
        .jpeg()
        .toFile(_fullPath)
      })
      tasks.push(() => {
        const _path = `${filePath}_b.${fileExt}`
        const _fullPath = `${__dirname}/public/${_path}`
        return sharp(buffer)
        .resize(1024)
        .quality(80)
        .progressive()
        .jpeg()
        .toFile(_fullPath)
      })
      return Promise.all(tasks.map(task => task()))
    } catch (err) {
      return null
    }
  }
  schema.statics.filter = async function (params = {}, extQuery = {}) {
    try {
      const query = {
        deleted: false,
      }
      if (params.language && params.learningLanguages) {
        query.$or = [
          {
            nativeLanguage: {
              $in: params.language.split(','),
            },
          },
          {
            learningLanguages: {
              $in: params.learningLanguages.split(','),
            },
          },
        ]
      }
      if (params.language && !params.learningLanguages) {
        query.$or = [
          {
            nativeLanguage: {
              $in: params.language.split(','),
            },
          },
        ]
      }
      if (params.anyLanguage) {
        query.$or = [
          {
            nativeLanguage: {
              $in: params.anyLanguage.split(','),
            },
          },
          {
            learningLanguages: {
              $in: params.anyLanguage.split(','),
            },
          },
        ]
      }
      if (params.nativeLanguage) {
        query.nativeLanguage = {
          $in: params.nativeLanguage.split(','),
        }
      }
      if (params.learningLanguages) {
        query.learningLanguages = {
          $in: params.learningLanguages.split(','),
        }
      }
      if (params.lat !== null && params.lng !== null
        && params.distance) {
        query.loc = {}
        query.loc.$near = {
          $maxDistance: params.distance * 1000,
          $geometry: {
            type: 'Point',
            coordinates: [params.lng, params.lat],
          },
        }
      }
      Object.assign(query, extQuery)
      let Filter = this.find(query)
      if (params.limit) {
        Filter = Filter.limit(params.limit)
      }
      if (params.offset) {
        Filter = Filter.skip(params.offset)
      }
      if (params.sort) {
        Filter = Filter.sort(params.sort)
      }
      if (params.select) {
        if (Array.isArray(params.select)) {
          Filter = Filter.select(params.select.join(' '))
        } else {
          Filter = Filter.select(params.select)
        }
      }
      const profiles = await Filter
      return profiles
    } catch (err) {
      console.error(err)
      return []
    }
  }
  schema.methods.filter = async function (params, extQuery) {
    if (params.distance) {
      params.loc = {}
      params.loc.$near = {
        $maxDistance: params.distance * 1000,
        $geometry: {
          type: 'Point',
          coordinates: this.loc,
        },
      }
    }
    if (!extQuery) {
      extQuery = {
        _id: {
          $ne: this.id,
        },
      }
    }
    return this.constructor.filter(params, extQuery)
  }

  schema.methods.saveAvatar = async function() {
    const title = `profile_${this.id}`
    const buffer = this.avatar
    const path = await ctx.helpers.saveFile(title, this.avatar)
    const timestamp = `?timestamps=${new Date().getTime()}`
    this.avatar = `${path}${timestamp}`
    // console.log('Создал аватарку: ' + this.avatar)
    await this.saveResizedAvatars(buffer)
    return this
  }

  schema.methods.getIdentity = function (params) {
    const object = _.pick(this.toObject(), ['_id', 'email', 'name'])
    if (!params) {
      return object
    }
    return Object.assign(object, params)
  }

  schema.methods.isMyJay = async function(profileId) {
    const { Request } = ctx.models
    const requests = await Request.find({
      $or: [
        {
          from: profileId,
          to: this._id,
          status: 'ACCEPTED',
        },
        {
          to: profileId,
          from: this._id,
          status: 'ACCEPTED',
        },
      ],
    })
    if (requests && Array.isArray(requests) && requests.length > 0) {
      return true
    }
    return false
  }

  schema.methods.findLastMessage = async function(profileId) {
    const { Message } = ctx.models
    return Message
    .findOne({
      $or: [
        {
          from: profileId,
          to: this.id,
        },
        {
          from: this.id,
          to: profileId,
        },
      ],
    })
    .sort({ createdAt: -1 })
  }
  // Найти и записат последнее сообщение от этого юзера
  schema.methods.setLastMessageTo = async function(profileId) {
    // console.log(`Я ${this.name}`)
    const message = await this.findLastMessage(profileId)
    // console.log('Последнее сообщение ', { message })
    if (message && message.text) {
      this.lastMessage = message.text
      this.lastMessageObject = message
    } else {
      this.lastMessageObject = null
      this.lastMessage = null
    }
    return this
  }
  // Найти и записать последнее сообщение от или к этому юзеру
  schema.methods.setLastGeneralMessage = async function(profileId) {
    this.lastGeneralMessage = await this.findLastMessage()
    return this
  }

  schema.methods.sendEmail = function (inputParams) {
    try {
      if (!transporter) {
        throw e500('!transporter')
      }
      if (!this.email) return null
      let params = inputParams
      if (typeof params === 'string') {
        params = {
          text: params,
        }
      }
      const options = Object.assign({
        to: this.email,
      }, ctx.config.mail.options, params)
      return transporter.sendMailAsync(options);
    } catch (err) {
      console.error(err)
      return { err }
    }
  }

  schema.methods.notifyEmail = async function(emailType, params) {
    const avaible = ['sign_in', 'recovery_password']
    if (avaible.indexOf(emailType) === -1) return null
    if (!this.email || !validator.isEmail(this.email)) return null
    Object.assign(params, { _profile: this.toJSON() }, { language: this.nativeLanguage, type: emailType })
    return ctx.services.MailNotifications.sendEmail({
      to: this.email,
    }, params)
  }

  schema.methods.notify = async function(msgType, params) {
    if (!ctx.config.push_notifications) return null
    try {
      const { PushNotifications } = ctx.services
      if (!PushNotifications.check(this.id, msgType)) return null
      PushNotifications.update(this.id, msgType)
      const pushParams = Object.assign({}, params)
      const getNotice = await notify.get(msgType)
      const notice = await getNotice(params, this.nativeLanguage)
      pushParams.myProfile = this.toJSON()
      pushParams.myProfileId = this.id
      pushParams.title = notice
      pushParams.type = msgType
      const notifications = await this.getNotifications()
      pushParams.notificationsCount = notifications.all
      return PushNotifications.pushSend(this.devices, onlyId(pushParams))
    } catch (err) {
      console.error(err)
      return err
    }
  }
  schema.statics.notify = async function(profileId, msgType, params) {
    const profile = await this.findById(profileId)
    if (!profile || !profile.notify) {
      return null
    }
    return profile.notify(msgType, params)
  }
  schema.methods.testNotify = async function(msgType) {
    try {
      let params = {}
      const { Profile, Event, Request } = ctx.models
      const msgTypes = []
      for (let i = 0; i < 20; i++) {
        msgTypes.push('msg' + (i+1))
      }
      if (msgType === 'msg1') {
        // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
        const fromProfile = await Profile.findOne({})
        params = { fromProfile, fromProfileId: fromProfile.id }
      }
      if (msgType === 'msg2') {
        // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
        const toProfile = await Profile.findOne({})
        const request = await Request.findOne({})
        params = {
          // fromProfile,
          request,
          // fromProfileId: fromProfile.id,
          requestId: request.id,
          toProfile,
          toProfileId: toProfile.id,
        }
      }
      if (msgType === 'msg3') {
        // ! //
        // const profile = await Profile.findById('580aa0299176c70012ef469f')
        const profile = await Profile.findOne({})
        const request = await Request.findOne({})
        params = { profile, request, profileId: profile.id, requestId: request.id }
      }
      if (msgType === 'msg4') {
        // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
        const fromProfile = await Profile.findOne({})
        const request = await Request.findOne({})
        params = { fromProfile, request, requestId: request.id, fromProfileId: fromProfile.id }
      }
      if (msgType === 'msg5') {
        // ! //
        // const toProfile = await Profile.findById('580aa0299176c70012ef469f')
        const toProfile = await Profile.findOne({})
        const request = await Request.findOne({})
        params = { toProfile, request, requestId: request.id, toProfileId: toProfile.id }
      }
      if (msgType === 'msg6') {
        // const profile = await Profile.findById('580aa0299176c70012ef469f')
        const profile = await Profile.findOne({})
        const request = await Request.findOne({})
        params = { profile, request, profileId: profile.id, requestId: request.id }
      }
      if (msgType === 'msg7') {
        const event = await Event.findOne({})
        params = { event, eventId: event.id }
      }
      if (msgType === 'msg8') {
        // const profile = await Profile.findById('580aa0299176c70012ef469f')
        const profile = await Profile.findOne({})
        const event = await Event.findOne({})
        params = { profile, event, profileId: profile.id, eventId: event.id }
      }
      if (msgType === 'msg9') {
        // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
        const fromProfile = await Profile.findOne({})
        const message = 'Привет!'
        params = { fromProfile, message, fromProfileId: fromProfile.id }
      }
      if (msgType === 'msg10') {
        // const fromProfile = await Profile.findById('580aa0299176c70012ef469f')
        const fromProfile = await Profile.findOne({})
        const message = 'Привет!'
        params = { fromProfile, message, fromProfileId: fromProfile.id }
      }
      if (msgType === 'msg11') {
        // const profile = await Profile.findById('580aa0299176c70012ef469f')
        const profile = await Profile.findOne({})
        const request = await Request.findOne({})
        params = { request, profile, profileId: profile.id, requestId: request.id }
      }
      if (msgType === 'msg12') {
        // const profile = await Profile.findById('580aa0299176c70012ef469f')
        const profile = await Profile.findOne({})
        const request = await Request.findOne({})
        params = { request, profile, requestId: request.id, profileId: profile.id }
      }
      if (msgType === 'msg13') {
        const event = await Event.findOne({})
        params = { event, eventId: event.id }
      }
      if (msgType === 'msg14') {
        const event = await Event.findOne({})
        params = { event, eventId: event.id }
      }
      if (msgType === 'msg15') {
        const event = await Event.findOne({})
        params = { event, eventId: event.id }
      }
      if (msgType === 'msg16') {
        // const profile = await Profile.findById('580aa0299176c70012ef469f')
        const profile = await Profile.findOne({})
        params = { profile, profileId: profile.id }
      }
      if (msgType === 'msg17') {
        // const profile = await Profile.findById('580aa0299176c70012ef469f')
        const profile = await Profile.findOne({})
        params = { profile, profileId: profile.id }
      }
      if (msgType === 'msg18') {
        const text = 'Привет!'
        params = { text }
      }
      if (msgType === 'msg19') {
        const event = await Event.findOne({})
        params = { event, eventId: event.id }
      }
      if (msgType === 'msg20') {
        const event = await Event.findOne({})
        // const profile = await Profile.findById('580aa0299176c70012ef469f')
        const profile = await Profile.findOne({})
        params = { event, profile, eventId: event.id, profileId: profile.id }
      }
      if (msgTypes.indexOf(msgType) === -1) {
        throw e404('Неверно указан тип сообщения')
      }
      let pushParams = Object.assign({}, params)
      const getNotice = await notify.get(msgType)
      const notice = await getNotice(params, this.nativeLanguage)
      pushParams.myProfile = this.toJSON()
      pushParams.myProfileId = this.id
      pushParams.title = notice
      pushParams.type = msgType
      const notifications = await this.getNotifications()
      pushParams.notificationsCount = notifications.all
      pushParams = onlyId(pushParams)
      // await this.sendEmail(JSON.stringify(pushParams, null, 4))
      // console.log(pushParams)
      ctx.services.PushNotifications.sendPush(this.devices, pushParams)
      return {
        status: 'success',
        pushParams,
      }
    } catch (err) {
      console.error(err)
      return err
    }
  }

  schema.methods.getEvents = async function(params = {}) {
    const { Event } = ctx.models
    const query = {
      participants: {
        $in: [this._id],
      },
      status: {
        $ne: 'REJECTED',
      },
    }
    return Event
    .find(Object.assign(query, params))
    .sort('startDate')
  }
  schema.methods.getFutureEvents = async function(params = {}) {
    const { startDateTimeout } = ctx.config.logic.events
    const query = {
      startDate: {
        $gte: new Date() - startDateTimeout,
      },
    }
    Object.assign(query, params)
    return this.getEvents(query)
  }

  schema.methods.getNotifications = async function() {
    const { Request } = ctx.models.v2
    const counts = {
      all: 0,
      events: 0,
      requests: 0,
      messages: 0,
    }
    const profileId = this._id
    const { startDateTimeout } = ctx.config.logic.requests
    let requests = await Request.find({
      $or: [
        {
          to: profileId,
          status: 'REVIEW',
          startDate: {
            $gte: new Date() - startDateTimeout,
          },
          // reviewer: profileId,
        },
        {
          to: profileId,
          status: 'REVIEW',
          startDate: null,
          // reviewer: profileId,
        },
      ],
    })
    .populate('from')
    .populate('to')
    counts.messages = await this.getCountUnreadedMessages()
    requests = requests.filter(request => request.from && request.to)
    counts.requests = requests.length || 0
    counts.all = counts.requests + counts.events + counts.messages
    return counts
  }

  schema.methods.getLastRequest = async function(profileId, params) {
    const myId = this._id
    const query = {}
    const currentDate = new Date()
    const { startDateTimeout } = ctx.config.logic.requests
    // query.$or = [
    //   {
    //     to: myId,
    //     status: 'REVIEW',
    //     startDate: null,
    //   },
    //   {
    //     from: myId,
    //     status: 'REVIEW',
    //     startDate: null,
    //   },
    // ]
    query.$or = [
      {
        to: myId,
        startDate: null,
        status: 'REVIEW',
      },
      {
        from: myId,
        startDate: null,
        status: 'REVIEW',
      },
      {
        to: myId,
        startDate: {
          $gte: currentDate - startDateTimeout,
        },
        status: 'REVIEW',
      },
      {
        from: myId,
        startDate: {
          $gte: currentDate - startDateTimeout,
        },
        status: 'REVIEW',
      },
    ]
    if (profileId) {
      query.$or[0].from = profileId
      query.$or[1].to = profileId
      query.$or[2].from = profileId
      query.$or[3].to = profileId
    }
    if (params) {
      Object.assign(query.$or[0], params)
      Object.assign(query.$or[1], params)
      Object.assign(query.$or[2], params)
      Object.assign(query.$or[3], params)
    }
    // console.log(JSON.stringify(query, null, 4))
    return ctx.models.Request
    .findOne(query)
    .populate('from')
    .populate('to')
    .sort({ createdAt: -1 })
  }

  schema.methods.generateAuthToken = function(params) {
    return jwt.sign(this.getIdentity(params), ctx.config.jwt.secret)
  }

  schema.methods.getCoords = async function() {
    const coords = {
      lat: this.loc[0],
      lng: this.loc[1]
    }
    return coords
  }

  schema.methods.setCoords = async function({ lat, lng }) {
    if (!lat) {
      throw e404('lat is not found')
    }
    if (!lng) {
      throw e404('lng is not found')
    }
    this.loc = [lng, lat]
  }
  schema.methods.getMyJays = async function(findParams) {
    const { Request } = ctx.models
    const myId = this._id
    const requests = await Request.find({
      $or: [
        {
          from: myId,
          status: 'ACCEPTED',
        }, {
          to: myId,
          status: 'ACCEPTED',
        },
      ],
    })
    const ids = []
    for (const request of requests) {
      if (myId !== request.from && ids.indexOf(request.from) === -1) {
        ids.push(request.from)
      }
      if (myId !== request.to && ids.indexOf(request.to) === -1) {
        ids.push(request.from)
      }
    }
    ids.map((id) => mongoose.Types.ObjectId(id)) // eslint-disable-line
    const query = {
      _id: {
        $ne: this._id,
        $in: ids,
      },
      deleted: false,
    }
    if (typeof(findParams) === 'object') {
      Object.assign(query, findParams)
    }
    return this.constructor.find(query)
  }
  // НАЙТИ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ ВОЗЛЕ МЕНЯ. distance указывается в КМ
  schema.methods.findNearestUsers = async function(distance, findParams = {}) {
    if (!this.loc || this.loc[0] == null || this.loc[1] == null) {
      return []
    }
    let query = {
      _id: {
        $ne: this._id,
      },
    }
    if (distance) {
      query.loc = {}
      query.loc.$near = {
        $maxDistance: distance * 1000,
        $geometry: {
          type: 'Point',
          coordinates: this.loc,
        },
      }
    }
    query = Object.assign(query, findParams)
    const profiles = await this.constructor.find(query)
    return profiles || []
  }
  schema.statics.getCoords = async function(profileId) {
    const profile = await this.findById(profileId).then(ctx.helpers.checkNotFound)
    return profile.getCoords()
  }
  schema.statics.setCoords = async function(profileId, coords) {
    const profile = await this.findById(profileId).then(ctx.helpers.checkNotFound)
    profile.setCoords(coords)
    return profile.save()
  }
  schema.statics.test = async function(profileId) {
    const profile = await this.findById(profileId).then(ctx.helpers.checkNotFound)
    return profile
  }

  schema.statics.updateLastVisit = async function (profileId) {
    try {
      const profile = await this.findById(profileId)
      if (profile && profile._id) {
        profile.lastVisitedAt = new Date()
        return profile.save()
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  // Для локальное регистрации
  schema.statics.generatePassword = function (length = 10) {
    return Math.random().toString(36).substr(2, length)
  }
  schema.methods.verifyPassword = async function (password) {
    // return this.password === password
    return await bcryptCompare(password, this.password)
  }

  schema.methods.getUnreadedMessages = async function() {
    const { Message } = ctx.models
    return Message.find({
      to: this._id.toString(),
      status: 'UNREAD',
    })
  }

  schema.methods.getCountUnreadedMessages = async function() {
    const { Message } = ctx.models
    const messages = await Message.aggregate([
      {
        $match: {
          to: this._id,
          status: 'UNREAD',
        },
      },
      {
        $group: {
          _id: '$from',
          count: { $sum: 1 }
        },
      },
    ])
    return messages.length
  }
  schema.methods.getCountUnreadedMessagesFromProfile = async function(profileId) {
    const { Message } = ctx.models
    const messages = await Message.aggregate([
      {
        $match: {
          to: this._id,
          from: ctx.db.Types.ObjectId(profileId),
          status: 'UNREAD',
        },
      },
      {
        $group: {
          _id: '$from',
          count: { $sum: 1 }
        },
      },
    ])
    if (messages && messages[0] && messages[0].count) {
      return messages[0].count
    }
    return 0
  }
  schema.methods.readAllMessagesFromProfile = async function(profileId) {
    const { Message } = ctx.models
    const messages = await Message.find({
      status: 'UNREAD',
      from: profileId,
      to: this._id.toString(),
    })
    const promises = messages.map(message => {
      message.status = 'READ'
      return message.save()
    })
    return Promise.all(promises)
  }

  return schema
}

export default(ctx) => {
  return ctx.db.model('Profile', getSchema(ctx), 'profile')
}
