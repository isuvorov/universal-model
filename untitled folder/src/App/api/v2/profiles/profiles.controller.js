import _ from 'lodash'
import GeoClusters from 'geo-clusters'
import supercluster from 'supercluster-indexes'
import iClusters from './igorson_clusters'
function shortUser(user) {
  return {
    id: user.id,
    nativeLanguage: user.nativeLanguage,
    firstName: user.firstName,
    avatars: {
      medium: user.avatars.small,
    },
    lat: user.lat,
    lng: user.lng,
  }
}

function getProfileFromCluster(profiles, i) {
  return _.pick(profiles[i], ['id', 'avatars', 'nativeLanguage', 'lat', 'lng', 'type'])
}
function getProfilesFromCluster(profiles, cluster) {
  return cluster.indexes
  .map(index => profiles[index])
  .map(profile => _.pick(profile, ['id', 'avatars', 'nativeLanguage', 'lat', 'lng', 'type']))
}
function getPrioritetProfileFromCluster(profiles, cluster) {
  const _profiles = getProfilesFromCluster(profiles, cluster)
  return _.sortBy(_profiles, (_profile) => new Date(_profile.createdAt))[0]
}

export default(ctx) => {
  const { Profile, Request, Message } = ctx.models
  const { e401, e400, e404, e500 } = ctx.errors // eslint-disable-line
  const { checkNotFound, isAuth, _checkNotFound } = ctx.helpers

  const controller = {}

  controller.getMap2 = async function(req) {
    const params = req.allParams()
    _.omit(params, 'limit')
    if (!params.distance) {
      params.distance = 25
    }
    if (!params.minClusterCount) {
      params.minClusterCount = 10
    }
    if (!params.zoom) {
      params.zoom = 1
    }
    if (params.lat) {
      params.lat = Math.round((params.lat * 10) / 10)
    }
    if (params.lng) {
      params.lng = Math.round((params.lng * 10) / 10)
    }
    params.select = ['loc', 'nativeLanguage', 'avatar', 'createdAt']
    let profiles = await Profile.filter(params)
    profiles = profiles.filter(profile => {
      return !!profile.lat && !!profile.lng
    })
    const profilePoints = profiles
    .map((profile, i) => {
      return {
        type: 'Feature',
        properties: {
          index: i,
        },
        geometry: {
          type: 'Point',
          coordinates: profile.loc,
        },
      }
    })
    const index = supercluster({
      radius: params.distance,
      maxZoom: 25,
      minZoom: 10,
    });
    index.load(profilePoints);
    const clusters = index.getClusters([-180, -85, 180, 85], params.zoom)
    // return clusters
    const result = clusters.map(cluster => {
      if (cluster.properties.cluster) {
        // if (params.only !== 'clusters' && (params.only === 'users' ||
        // cluster.properties.point_count < params.minClusterCount)) {
        //   return cluster.indexes.map(i => {
        //     return getProfileFromCluster(profiles, i)
        //   })
        // }
        return {
          type: 'cluster',
          lng: cluster.geometry.coordinates[0],
          lat: cluster.geometry.coordinates[1],
          count: cluster.properties.point_count,
          user: getPrioritetProfileFromCluster(profiles, cluster),
        }
      }
      return Object.assign(getProfileFromCluster(profiles, cluster.properties.index),
      { type: 'user' })
    })
    return _.flatten(result)
  }
  controller.getMap = async function(req) {
    const params = req.allParams()
    _.omit(params, 'limit')
    if (!params.distance) {
      params.distance = 25
    }
    if (!params.minClusterCount) {
      params.minClusterCount = 10
    }
    if (!params.zoom) {
      params.zoom = 1
    }
    // params.distance /= 3
    params.select = ['loc', 'nativeLanguage', 'avatar', 'createdAt', 'firstName']
    let profiles = await Profile.filter(params)

    profiles = profiles.filter(profile => {
      return !!profile.lat && !!profile.lng
    })
    const clustersOrUsers = iClusters(profiles, params)
    const points = clustersOrUsers.map(point => {
      if (point.type === 'cluster') {
        return {
          type: 'cluster',
          lat: point.lat,
          lng: point.lng,
          user: shortUser(point.user),
          count: point.users.length,
        }
      }
      return { ...shortUser(point), type: 'user' }
    })
    return points
  }

  controller.create = async function(req) {
    const params = req.allParams()
    if (params.socialNetworkType === 'local') {
      return controller.createLocal(req)
    }
    return controller.createBySocialNetwork(req)
  }
  controller.createLocal = async function(req) {
    const params = req.allParams()
    const fields = [
      'nativeLanguage',
      'learningLanguages',
      'bdate',
      'email',
      'socialNetworkType',
    ]
    for (const field of fields) {
      if (!params[field]) {
        throw e400(`param ${field} is not found`)
      }
    }
    const { email, socialNetworkType } = params
    const existProfile = await Profile.findOne({
      email,
      socialNetworkType,
      deleted: false,
    })
    if (existProfile) {
      throw e400(`the user with the E-mail ${email} is already registered`)
    }
    const profile = new Profile(params)
    await profile.save()
    if (params.lat && params.lng) {
      // Устанавливаем их
      profile.setCoords({ lat: params.lat, lng: params.lng })
      await profile.save()
      // Ищем ближайших юзеров, которые изучают определенный язык
      const profiles = await profile.findNearestUsers(ctx.config.logic.profiles.onRegister, {
        learningLanguages: {
          $in: [profile.nativeLanguage],
        },
      })
      // PUSH BEGIN
      const promises = profiles.map(nearProfile => {
        if (!nearProfile || !nearProfile.notify || !nearProfile._id) {
          return null
        }
        nearProfile.notify('msg17', {
          profile,
          profileId: profile.id,
        })
        return true
      })
      await Promise.all(promises)
      // PUSH END
    }
    // Уведомление на почту
    profile.notifyEmail('sign_in', {
      password: params.password,
      login: params.email,
    })
    return { profile, token: profile.generateAuthToken() }
  }
  controller.createBySocialNetwork = async function(req) {
    const params = req.allParams()
    const fields = [
      // 'email',
      'nativeLanguage',
      'learningLanguages',
      'bdate',
      // 'pubNub',
      'linkToSocialNetwork',
      'socialNetworkType',
    ]
    for (const field of fields) {
      if (!params[field]) {
        throw e400(`param ${field} is not found`)
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
    const profile = new Profile(params)
    await profile.save()
    // Если прислали координаты
    if (params.lat && params.lng) {
      // Устанавливаем их
      profile.setCoords({ lat: params.lat, lng: params.lng })
      await profile.save()
      // Ищем ближайших юзеров, которые изучают определенный язык
      const profiles = await profile.findNearestUsers(ctx.config.logic.profiles.onRegister, {
        learningLanguages: {
          $in: [profile.nativeLanguage],
        },
      })
      // PUSH BEGIN
      const promises = profiles.map(nearProfile => {
        if (!nearProfile || !nearProfile.notify || !nearProfile._id) {
          return null
        }
        nearProfile.notify('msg17', {
          profile,
          profileId: profile.id,
        })
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
    try {
      if (request) {
        const { from, to } = request
        profile.request = request.toJSON()
        profile.request.from = from.toJSON()
        profile.request.to = to.toJSON()
      } else {
        profile.request = null
      }
    } catch (err) {
      profile.request = null
    }
    return profile
  }

  controller.recovery = async function (req) {
    const params = req.allParams()
    if (!params.email) {
      throw e400('email not found')
    }
    const { email } = params
    if (typeof email !== 'string') {
      throw e400('Email is not string')
    }
    const profile = await Profile.findOne({
      email: email.toLowerCase(),
      socialNetworkType: 'local',
      deleted: false,
    })
    .then(_checkNotFound('User'))
    const password = Profile.generatePassword()
    profile.password = password
    await profile.save()
    // Уведомление на email
    profile.notifyEmail('recovery_password', {
      password,
    })
    // await profile.sendEmail({
    //   subject: 'Восстановление пароля',
    //   text: `Ваш новый пароль: ${password}`,
    // })
    return {
      status: 'success',
    }
  }

  controller.validate = async function (req) {
    const params = req.allParams()
    const profile = await Profile.findOne({
      email: params.email,
      socialNetworkType: 'local',
      deleted: false,
    })
    return {
      email: !profile,
    }
  }

  controller._getMap = async function (req) {
    const params = req.allParams()
    let k = params.limit
    _.omit(params, 'limit')
    if (!params.distance) {
      params.distance = 25
    }
    if (!params.minClusterCount) {
      params.minClusterCount = 1
    }
    if (params.lat) {
      params.lat = Math.round((params.lat * 10) / 10)
    }
    if (params.lng) {
      params.lng = Math.round((params.lng * 10) / 10)
    }
    params.select = ['loc', 'nativeLanguage', 'avatar', 'createdAt']
    let profiles = await Profile.filter(params)
    // return profiles
    profiles = profiles.filter(profile => {
      return profile.lat !== null && profile.lng != null
    })
    // return profiles
    const profileCoordinates = profiles.map(profile => [profile.lng, profile.lat])
    .filter(coordinates => coordinates[0] !== null && coordinates[1] !== null)

    if (profileCoordinates.length < k) {
      k = profileCoordinates.length
    }
    if (k === 0 || profileCoordinates.length === 0) return []
    if (k < 1) k = 1
    // return profileCoordinates
    const clustersMaker = new GeoClusters()
    clustersMaker.k(k)
    clustersMaker.iterations(100)
    clustersMaker.data(profileCoordinates)
    const clusters = clustersMaker.clusters()
    const clustersAndUsers = clusters.map(cluster => {
      cluster.count = cluster.clusterInd.length
      cluster.lat = cluster.centroid[1]
      cluster.lng = cluster.centroid[0]
      if (params.only !== 'clusters' && (params.only === 'users' ||
      cluster.count < params.minClusterCount)) {
        return getProfilesFromCluster(profiles, cluster)
      }
      cluster.type = 'cluster'
      cluster.user = getProfileFromCluster(profiles, cluster)
      return _.omit(cluster, ['cluster', 'clusterInd', 'centroid'])
    })
    return _.flatten(clustersAndUsers)
  }

  controller.updateMe = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    const params = req.allParams()
    const profile = await Profile.findById(profileId)
    .then(checkNotFound)
    Object.assign(profile, params)
    return profile.save()
  }
  controller.setCoordinates = async(req) => {
    isAuth(req)
    const _params = req.allParams()
    const coords = {
      lat: _params.lat,
      lng: _params.lng,
    }
    try {
      return Profile.findByIdAndUpdate(req.user._id, {
        $set: {
          loc: [coords.lng, coords.lat],
        },
      })
    } catch (err) {
      return {
        id: req.user._id,
      }
    }
  }

  controller.getFutures = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    const { startDateTimeout } = ctx.config.logic.requests
    const currentDate = new Date()
    let requests = await Request.find({
      $or: [
        {
          from: profileId,
          status: 'ACCEPTED',
          startDate: {
            $gte: currentDate - startDateTimeout,
          },
        },
        {
          to: profileId,
          status: 'ACCEPTED',
          startDate: {
            $gte: currentDate - startDateTimeout,
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
    const profileId = req.user._id
    const profile = await Profile.findById(profileId).then(checkNotFound)
    const { startDateTimeout } = ctx.config.logic.requests
    const currentDate = new Date()
    const requests = await Request.find({
      $or: [
        {
          from: profileId,
          status: 'ACCEPTED',
          startDate: {
            $gte: currentDate - startDateTimeout,
          },
        },
        {
          to: profileId,
          status: 'ACCEPTED',
          startDate: {
            $gte: currentDate - startDateTimeout,
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
      if (_request.to && _request.sender &&
        _request.sender.toString() === _request.to.toString()) {
        const _to = _request.to
        _request.to = _request.from
        _request.from = _to
      }
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
    let profile = await Profile.findById(id).then(_checkNotFound('Profile'))
    const myProfile = await Profile.findById(profileId).then(_checkNotFound('Profile'))
    const [events, request] = await Promise.all([
      profile.getFutureEvents(),
      profile.getLastRequest(profileId, {
        status: {
          $in: ['REVIEW', 'ACCEPTED'],
        },
      }),
    ])
    const chatAvailable = true
    await profile.setLastMessageTo(profileId)
    const countMessages = await myProfile.getCountUnreadedMessagesFromProfile(id)
    profile = profile.toJSON()
    if (countMessages > 0) {
      profile.newMessage = 1
    } else {
      profile.newMessage = 0
    }
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
      if (profile.request &&
          profile.request.from &&
          profile.request.to.id &&
          profile.request.sender &&
          profile.request.sender.toString() === profile.request.to.id.toString()) {
        const _to = profile.request.to
        profile.request.to = profile.request.from
        profile.request.from = _to
      }
      delete profile.request.sender
    } else {
      profile.request = null
    }
    if (profile.request && !profile.request.sender) {
      profile.request.sender = profile.request.from.id
    }
    return profile
  }

  controller.getMyJays = async(req) => {
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
    // Находим Jays по ID
    const { messagesFromMe, messagesToMe } = await Promise.props({
      messagesFromMe: Message.aggregate([
        {
          $match: {
            from: ctx.db.Types.ObjectId(profileId),
          },
        },
        {
          $group: {
            _id: '$to',
          },
        },
      ]),
      messagesToMe: Message.aggregate([
        {
          $match: {
            to: ctx.db.Types.ObjectId(profileId),
          },
        },
        {
          $group: {
            _id: '$from',
          },
        },
      ]),
    })
    messagesFromMe.forEach(message => {
      if (message._id) {
        const id = message._id.toString()
        if (profilesIds.indexOf(id) === -1) {
          profilesIds.push(id)
        }
      }
    })
    messagesToMe.forEach(message => {
      if (message._id) {
        const id = message._id.toString()
        if (profilesIds.indexOf(id) === -1) {
          profilesIds.push(id)
        }
      }
    })
    let jays = await myProfile.filter(params, {
      _id: {
        $ne: profileId,
        $in: profilesIds,
      },
      deleted: false,
    })
    // Добавляем последнее сообщение к этому джею
    // неважно от нас сообщение или от него
    const jayPromises = jays.map(jay => {
      if (jay && jay.findLastMessage) {
        return jay.findLastMessage(profileId)
        .then(message => {
          jay.lastMessageObject = message
          return jay
        })
      }
      return jay
    })
    jays = await Promise.all(jayPromises)
    // Соритруем их по времени написаняи сообщений
    // jays[0].lastMessageObject.createdAt = new Date()
    jays = _.sortBy(jays, jay => {
      if (jay.lastMessageObject && jay.lastMessageObject.createdAt) {
        return -new Date(jay.lastMessageObject.createdAt).getTime()
      }
      return null
    })
    // Сортируем по тому, прочитано ли сообщение
    // Самыми первыми будут непрочитанные сообщения написанные мне
    jays = _.sortBy(jays, jay => {
      if (jay.lastMessageObject
        && jay.lastMessageObject.status === 'UNREAD'
        && jay.lastMessageObject.to
        && jay.lastMessageObject.to.toString() === profileId) {
          return 0
      }
      return 1
    })
    return Promise.all(jays.map(jay => {
      return myProfile
      .getCountUnreadedMessagesFromProfile(jay.id)
      .then(count => {
        jay.newMessage = 0
        if (count > 0) jay.newMessage = 1
        return jay
      })
    }))
  }

  controller.getList = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    const profile = await Profile.findById(profileId).then(checkNotFound)
    // const findParams = {}
    const params = req.allParams()
    // if (params.language) {
    //   findParams.nativeLanguage = params.language
    // }
    params.limit = params.limit || 50
    params.offset = params.offset || 0
    params.lat = params.lat || profile.lat
    params.lng = params.lng || profile.lng
    if (params.lat !== null && params.lng !== null) {
      params.distance = params.distance || 500
    }
    return profile.filter(params)
    // return profiles
    // const promises = profiles.map(_profile => {
    //   const distance = getDistanceFromLatLonInKm(params.lat, params.lng, _profile.lat, _profile.lng)
    //   return distance
    // })
    // return Promise.all(promises)
  }

  // controller.getMap = async function(req) {
  //   isAuth(req)
  //   const profileId = req.user._id
  //   const myProfile = await Profile.findById(profileId).then(checkNotFound)
  //   // const findParams = {}
  //   const params = req.allParams()
  //   params.limit = params.limit || 0
  //   params.offset = params.offset || 0
  //   params.lat = params.lat || myProfile.lat
  //   params.lng = params.lng || myProfile.lng
  //   params.distance = params.distance || 50000000
  //   params.select = ['id', 'avatar', 'loc', 'nativeLanguage']
  //   const profiles = await myProfile.filter(params)
  //   const promises = profiles.map(profile => {
  //     if (profile && profile.pick) {
  //       const avatar = profile.avatars.small
  //       const _profile = profile.pick(['id', 'lat', 'lng', 'avatar', 'language'])
  //       _profile.type = 'user'
  //       _profile.avatar = avatar
  //       return _profile
  //     }
  //     return null
  //   }).filter(profile => !!profile)
  //   return Promise.all(promises)
  // }

  controller.getCoordinates = async(req) => {
    isAuth(req)
    return Profile.getCoords(req.user._id)
  }

  controller.getNew = async (req) => {
    const params = req.allParams()
    const limit = params.limit || 10
    return Profile
    .find({
      deleted: false,
    })
    .sort({
      createdAt: -1,
    })
    .limit(limit)
  }

  controller.findNearestUsers = async(req) => {
    isAuth(req)
    const profile = await Profile.findById(req.user._id).then(checkNotFound)
    return profile.findNearestUsers(ctx.config.logic.profiles.jaysDistance)
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

  controller.filter = async (req) => {
    isAuth(req)
    const params = req.allParams()
    const profile = await Profile.findById(req.user._id)
    .then(_checkNotFound('Profile'))
    return profile.filter(params)
  }
  controller.remove = async (req) => {
    isAuth(req)
    const profileId = req.user._id
    const profile = await Profile.findById(profileId)
    .then(_checkNotFound('Profile'))
    profile.deleted = true
    return profile.save()
  }

  return controller
}
