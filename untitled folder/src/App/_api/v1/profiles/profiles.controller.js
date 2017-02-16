import _ from 'lodash'
import getPlaceApi from '../place/place.api'
export default(ctx, parent) => {
  const { Profile, Event, Request } = ctx.models
  const { e401, e400, e404, e500 } = ctx.errors // eslint-disable-line
  const { checkNotFound, isAuth, saveFile, isBase64 } = ctx.helpers

  const controller = {}

  controller.create = async (req) => {
    const params = req.allParams()
    const fields = [
      // 'name',
      'nativeLanguage',
      'learningLanguages',
      'bdate',
      // 'pubNub',
      'linkToSocialNetwork',
      'socialNetworkType',
    ]
    for (const field of fields) {
      if (!params[field]) {
        throw e400(`Поле ${field} не передано`)
      }
    }

    const _profile = await Profile.findOne({
      linkToSocialNetwork: params.linkToSocialNetwork,
      socialNetworkType: params.socialNetworkType,
      deleted: false,
    })
    if (_profile) {
      throw e400('Такой пользователь уже зарегистрирован')
    }
    let _avatar = null
    if (params.avatar != null) {
      _avatar = params.avatar
      delete params.avatar
    }
    const profile = new Profile(params)
    await profile.save()
    if (_avatar !== null) {
      if (isBase64(_avatar) == true) {
        const title = 'profile_' + profile._id
        _avatar = await saveFile(title, _avatar)
      }
      profile.avatar = _avatar
      await profile.save()
    }
    // Если прислали координаты
    if (params.lat && params.lng) {
      // Устанавливаем их
      profile.setCoords({ lat: params.lat, lng: params.lng })
      await profile.save()
      // Ищем ближайших юзеров, которые изучают определенный язык
      const profiles = await profile.findNearestUsers(50, {
        learningLanguages: {
          $in: [profile.nativeLanguage],
        },
      })
      // PUSH BEGIN
      const promises = profiles.map(nearProfile => {
        if (!nearProfile || !nearProfile.notify || !nearProfile._id) {
          return null
        }
        nearProfile.notify('msg17', { profile })
        return true
      })
      await Promise.all(promises)
      // PUSH END
    }

    return { profile, token: profile.generateAuthToken() }
  }

  controller.getMe = async(req) => {
    isAuth(req)
    let profile = await Profile.findById(req.user._id).then(ctx.helpers.checkNotFound)
    const [events, request] = await Promise.all([
      profile.getFutureEvents(),
      profile.getLastRequest(null, {
        status: {
          $in: ['REVIEW', 'ACCEPTED'],
        },
      }),
    ])
    profile = profile.toJSON()
    profile.events = events
    if (request) {
      const { from, to } = request
      profile.request = request.toJSON()
      profile.request.from = from.toJSON()
      profile.request.to = to.toJSON()
    } else {
      profile.request = null
    }
    return profile
  }

  controller.updateMe = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    const params = req.allParams()
    if (params.avatar) {
      const profile = await Profile.findById(profileId).then(checkNotFound)
      const title = 'profile_' + profileId
      const avatar = await saveFile(title, params.avatar)
      profile.avatar = avatar
      await profile.save()
      delete params.avatar
    }
    return Profile.findByIdAndUpdate(req.user._id, params, { new: true })
    .then(ctx.helpers.checkNotFound)
  }
  controller.setCoordinates = async(req) => {
    isAuth(req)
    const _params = req.allParams()
    const coords = {
      lat: _params.lat,
      lng: _params.lng,
    }
    try {
      const profile = await Profile.findById(req.user._id).then(checkNotFound)
      profile.setCoords(coords)
      return profile.save()
    } catch (err) {
      return {
        id: req.user._id,
      }
    }
  }

  // controller.getFutures = async(req) => {
  //   isAuth(req)
  //   const profileId = req.user._id
  //   let events = await Event.find({})
  //   events = events.map((event) => {
  //     event = event.toJsonForFutures()
  //     return event
  //   })
  //   return events
  // }
  controller.getFutures = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    let requests = await Request.find({
      $or: [
        {
          from: profileId,
          status: 'ACCEPTED',
          startDate: {
            $gte: new Date(),
          },
        },
        {
          to: profileId,
          status: 'ACCEPTED',
          startDate: {
            $gte: new Date(),
          },
        },
      ],
    })
    .populate('to')
    .populate('from')
    .sort('startDate')
    requests = requests.map((request) => {
      request = request.toJsonForFuture(profileId)
      return request
    })
    return requests
  }

  controller.getAllFutures = async (req) => {
    isAuth(req)
    const params = req.allParams()
    const profileId = req.user._id
    const profile = await Profile.findById(profileId).then(checkNotFound)
    const requests = await Request.find({
      $or: [
        {
          from: profileId,
          status: 'ACCEPTED',
          startDate: {
            $gte: new Date(),
          },
        },
        {
          to: profileId,
          status: 'ACCEPTED',
          startDate: {
            $gte: new Date(),
          },
        },
      ],
    })
    .populate('to')
    .populate('from')
    .sort('startDate')
    const events = await profile.getFutureEvents()
    let future = []
    const fields = ['id', 'status', 'title', 'coverImage', 'place', 'startDate', 'language', 'lastMessage', 'isOnline', '_type', 'requestId']
    events.forEach((event) => {
      let _event = event.toJSON()
      _event._type = 'event'
      _event = _.pick(_event, fields)
      future.push(_event)
    })
    requests.forEach((request) => {
      const requestId = request._id
      let _request = request.toJsonForAllFutures(profileId)
      _request._type = 'request'
      if (_request && _request.from && request.from._id && request.from._id.toString() !== profileId) {
        _request.id = request.from._id
      }
      if (_request && _request.to && request.from._id && request.to._id.toString() !== profileId) {
        _request.id = request.to._id
      }
      _request.requestId = requestId
      _request = _.pick(_request, fields)
      future.push(_request)
    })
    future = _.sortBy(future, (obj) => {
      return -obj.startDate
    })
    return future
  }
  controller.getProfile = async(req) => {
    isAuth(req)
    const params = req.allParams()
    const profileId = req.user._id
    const id = params.id
    let profile = await Profile.findById(id).then(checkNotFound)
    const [events, request] = await Promise.all([
      profile.getFutureEvents(),
      profile.getLastRequest(profileId, {
        status: {
          $in: ['REVIEW', 'ACCEPTED'],
        },
      }),
    ])
    const chatAvailable = await profile.isMyJay(req.user._id)
    await profile.setLastMessageTo(profileId)
    profile = profile.toJSON()
    profile.chatAvailable = chatAvailable
    profile.events = events
    let askHelp = await Request.findOne({
      from: profileId,
      to: id,
      help: 'help_me',
      status: {
        $ne: 'REJECTED',
      }
    })
    .sort({ createdAt: 1 })

    const offerHelp = await Request.findOne({
      from: id,
      to: profileId,
      help: 'help_you',
      status: {
        $ne: 'REJECTED'
      }
    })
    .sort({ createdAt: 1 })
    profile.askHelp = null
    profile.offerHelp = null
    if (askHelp && askHelp._id) {
      profile.askHelp = askHelp._id
    }
    if (offerHelp && offerHelp._id) {
      profile.offerHelp = offerHelp._id
    }
    if (profileId === id) {
      return profile
    }
    if (request) {
      const { from, to } = request
      profile.request = request.toJSON()
      profile.request.from = from.toJSON()
      profile.request.to = to.toJSON()
    } else {
      profile.request = null
    }
    return profile
  }

  controller.getMyJays = async(req) => {
    console.log('getMyJaysv1')
    isAuth(req)
    const params = req.allParams()
    let language = params.language || null
    if (language && language.indexOf(',') >= 0) {
      language = language.split(',')
    }
    const profileId = req.user._id
    const myProfile = await Profile.findById(profileId).then(checkNotFound)
    const findParams = {
      status: 'ACCEPTED',
    }
    const requests = await Request.find({
      $or: [
        Object.assign(_.clone(findParams), { from: profileId }),
        Object.assign(_.clone(findParams), { to: profileId })
      ],
    })
    .populate('from')
    .populate('to')
    const profiles = []
    const profilesIds = []
    requests.forEach((request) => {
      if (request.from && request.from._id && request.from._id != profileId) {
        request.from._id = request.from._id.toString()
        if (profilesIds.indexOf(request.from._id.toString()) === -1) {
          if (language) {
            if (language.indexOf(request.from.nativeLanguage) >= 0) {
              profilesIds.push(request.from._id.toString())
            }
          } else {
            profilesIds.push(request.from._id.toString())
          }
        }
      }
      if (request.to && request.to._id && request.to._id != profileId) {
        request.to._id = request.to._id.toString()
        if (profilesIds.indexOf(request.to._id.toString()) === -1) {
          if (language) {
            if (language.indexOf(request.to.nativeLanguage) >= 0) {
              profilesIds.push(request.to._id.toString())
            }
          } else {
            profilesIds.push(request.to._id.toString())
          }
        }
      }
    })
    // Дистанция по дефолту 25км
    const distance = params.distance ? Number(params.distance) : 25 || 25
    // Найти всех юзеров в радиусе
    // const jays = await myProfile.findNearestUsers(distance, {
    //   _id: {
    //     $ne: profileId,
    //     $in: profilesIds,
    //   },
    // })
    // Найти последнии сообщения между нами
    // const jaysPromises = jays.map(jay => {
    //   return jay.setLastMessageTo(profileId)
    // })
    // return Promise.all(jaysPromises)
    return Profile.find({
      _id: {
        $ne: profileId,
        $in: profilesIds,
      },
      deleted: false,
    })
  }

  controller.getList = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    const profile = await Profile.findById(profileId).then(checkNotFound)
    const findParams = {}
    const params = req.allParams()
    if (params.language) {
      findParams.nativeLanguage = params.language
    }
    return profile.findNearestUsers(100000000000000000000, findParams)
  }

  controller.getCoordinates = async(req) => {
    isAuth(req)
    return Profile.getCoords(req.user._id)
  }

  controller.getNew = async (req) => {
    const params = req.allParams()
    const limit = params.limit || 10
    return Profile
    .find()
    .sort({
      createdAt: -1,
    })
    .limit(limit)
  }

  controller.findNearestUsers = async(req) => {
    isAuth(req)
    const profile = await Profile.findById(req.user._id).then(checkNotFound)
    return profile.findNearestUsers(20)
  }

  controller.setDevice = async (req) => {
    isAuth(req)
    const params = req.allParams()
    const profileId = req.user._id
    const fields = ['token', 'type']
    fields.forEach((field) => {
      if (params[field] == null) {
        throw e400(`Поле ${field} не передано`)
      }
    })
    const profile = await Profile.findById(profileId).then(checkNotFound)
    const { id, token, type } = params

    let devices = profile.devices
    let deviceExist = false
    devices = devices.map(device => {
      if (device.token === token && device.type === type) {
        device.token = token
        deviceExist = true
      }
      return device
    })
    if (!deviceExist) {
      const device = {
        id,
        token,
        type
      }
      devices.push(device)
    }
    profile.devices = devices
    await profile.save()
    return profile.devices
  }
  controller.deleteDevice = async (req) => {
    isAuth(req)
    const params = req.allParams()
    const profileId = req.user._id
    const profile = await Profile.findById(profileId).then(checkNotFound)
    const { id } = params

    profile.devices = profile.devices.filter((device) => {
      return device.id !== id && device.token !== id
    })
    await profile.save()
    return profile.devices
  }
  controller.getDevice = async (req) => {
    isAuth(req)
    const profileId = req.user._id
    const profile = await Profile.findById(profileId).then(checkNotFound)
    return profile.devices || []
  }

  return controller
}
