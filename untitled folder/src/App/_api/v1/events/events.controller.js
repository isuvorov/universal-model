import getPlacesApi from '../place/place.api.js'

// НЕТ ВРЕМЕНИ ОБЪЯСНЯТЬ
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1) // deg2rad below
  const dLon = deg2rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
//
export default(ctx, parent) => {
  const placeApi = getPlacesApi()
  const { Event, Profile }  = ctx.models
  const {e401, e400, e404, e500} = ctx.errors // eslint-disable-line
  const { checkNotFound, isAuth, saveFile } = ctx.helpers
  const controller = {}

  controller.get = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    const params = req.allParams()
    const eventId = params.id
    let event = await Event.findById(eventId).populate('participants').then(checkNotFound)
    const participants = await event.participantsToJSON()
    event = event.toJSON()
    event.participants = participants

    return event
  }

  controller.create = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    const params = req.allParams()
    const reqFields = ['language', 'startDate', 'place'];
    for (const field of reqFields) {
      if (params[field] == null) {
        throw e400(`Поле ${field} не найдено`)
      }
    }
    params.owner = profileId
    params.participants = [profileId]
    const coverImage = params.coverImage
    delete params.coverImage
    params.place = await placeApi.get(params.place) || params.place
    let event = new Event(params)
    await event.save()
    if (coverImage) {
      const title = 'event_' + event._id
      const _coverImage = await saveFile(title, coverImage)
      event.coverImage = _coverImage
      event = await event.save()
    }
    // PUSH BEGIN
    const nearUsers = await event.findNearestUsers(ctx.config.logic.events.distance, {
      _id: {
        $ne: profileId,
      },
      learningLanguages: {
        $in: [event.language],
      },
    })
    const promises = nearUsers.map(profile => {
      if (!profile || !profile._id || !profile.notify || profile._id.toString() === profileId) {
        return null
      }
      profile.notify('msg7', {
        event,
        eventId: event.id,
      })
      return true
    })
    await Promise.all(promises)
    // PUSH END
    const participants = await event.participantsToJSON()
    event = event.toJSON()
    event.participants = participants
    return event
  }

  controller.leave = async(req) => {
    isAuth(req)
    const params = req.allParams()
    const profileId = req.user._id
    const id = params.id
    const event = await Event.findById(id).then(checkNotFound)
    if (event.owner == profileId) {
      throw e400('Создатель встречи не может покинуть встречу')
    }
    event.participants = event.participants.filter((participant) => {
      return participant != profileId
    })
    return event.save()
  }
  controller.test = async (req) => {
    const params = req.allParams()
    const event = await Event.findById('580dd6293f5c7d1edbacc307')
    // Юлия 580d0d1cce38620012f72d32
    // Андрей 580dcf0fce38620012f72d41
    event.owner = '580dcf0fce38620012f72d41'
    return event.save()
  }

  controller.visit = async(req) => {
    isAuth(req)
    const params = req.allParams()
    const profileId = req.user._id
    const newMember = await Profile.findById(profileId).then(checkNotFound)
    const id = params.id
    let event = await Event.findById(id).then(checkNotFound)
    if (event.profileIsVisited(profileId)) {
      return event
    }
    const { participants } = event
    event.addParticipant(profileId)
    event = await event.save()
    // PUSH BEGIN
    const promises = participants.map((participant) => {
      return Profile.findById(participant.toString()).then(async (profile) => {
        if (!profile || !profile.notify || !profile._id) {
          return null
        }
        if (profile._id.toString() === profileId) {
          return null
        }
        const isMyJay = await profile.isMyJay(profileId)
        // Кто то новый придет на встречу
        if (isMyJay) {
          profile.notify('msg20', {
            event,
            profile: newMember,
            eventId: event.id,
            profileId: newMember.id,
          })
        } else {
          profile.notify('msg8', {
            event,
            profile: newMember,
            eventId: event.id,
            profileId: newMember.id,
          })
        }
        return true
      })
    })
    Promise.all(promises)
    // PUSH END
    return event
  }

  controller.reject = async(req) => {
    isAuth(req)
    const params = req.allParams()
    const profileId = req.user._id
    // return {profileId}
    const event = await Event.findById(params.id).populate('participants').populate('owner').then(checkNotFound)
    if (event.owner == null || event.owner && event.owner._id != profileId) {
      return event
    }
    if (event.status === 'REJECTED') {
      return event
    }
    event.status = 'REJECTED'
    await event.save()
    // PUSH BEGIN
    const promises = event.participants.map((participant) => {
      if (participant._id == event.owner._id) {
        return null
      }
      participant.notify('msg13', {
        event,
        profile: event.owner,
        eventId: event.id,
        profileId: event.owner.id,
      })
      return true
    })
    Promise.all(promises)
    // PUSH END
    return event
  }

  controller.update = async(req) => {
    isAuth(req)
    const params = req.allParams()
    const eventId = params.id
    const profileId = req.user._id
    // place and coverImage BEGIN
    params.place = await placeApi.get(params.place) || params.place
    if (params.coverImage != null) {
      const title = 'event_' + eventId
      params.coverImage = await saveFile(title, params.coverImage)
    }
    // place and coverImage END
    const event = await Event.findByIdAndUpdate(eventId, params, { new: true })
    .populate('participants')
    .then(checkNotFound)
    await event.save()
    // PUSH BEGIN
    if (params.place) {
      const promises = event.participants.map((participant) => {
        if (!participant || !participant._id || !event.owner) {
          return null
        }
        if (participant._id == event.owner.toString()) {
          return null
        }
        if (!participant.notify) {
          return null
        }
        participant.notify('msg14', {
          event,
          profile: participant,
          eventId: event.id,
          profileId: participant.id,
        })
        return true
      })
      Promise.all(promises)
      // Сообщаем ближайшим юзерам о встрече
      const profiles = event.findNearestUsers(ctx.config.logic.events.distance, {
        _id: {
          $ne: profileId,
        },
        learningLanguages: {
          $in: [event.language],
        },
      })
      const promises2 = profiles.map(profile => {
        // Если это не юзер
        if (!profile || !profile._id || !profile.notify) {
          return null
        }
        // Если это тот, кто изменил
        if (profile._id.toString() === profileId) {
          return null
        }
        profile.notify('msg7', { event })
        return true
      })
      Promise.all(promises2)
    }
    if (params.startDate) {
      const promises = event.participants.map((participant) => {
        if (!participant || !participant._id || !event.owner) {
          return null
        }
        if (participant._id == event.owner.toString()) {
          return null
        }
        if (!participant.notify) {
          return null
        }
        participant.notify('msg15', {
          event,
          profile: participant,
          eventId: event.id,
          profileId: participant.id,
        })
        return true
      })
      Promise.all(promises)
    }
    // PUSH END
    return event
  }

  controller.getList = async(req) => {
    isAuth(req)

    const profileId = req.user._id
    const params = req.allParams()
    const { startDateTimeout } = ctx.config.logic.events
    const findParams = {}
    if (params.actual === 'true' || params.actual === 'false') {
      try {
        params.actual = JSON.parse(params.actual)
      } catch (err) {
        console.error(err)
      }
    } else {
      params.actual = true
    }
    if (params.actual) {
      findParams.startDate = {
        // $gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        $gte: new Date() - startDateTimeout,
      }
      findParams.status = {
        $ne: 'REJECTED'
      }
    }
    if (params.language) {
      findParams.language = {
        $in: params.language.split(',')
      }
    }
    let events = await Event.find(findParams).then(checkNotFound)
    if (params.lat && params.lng) {
      params.lat = Number(params.lat)
      params.lng = Number(params.lng)
      const distance = Number(params.distance) || ctx.config.logic.events.distance
      events = events.filter((event) => {
        if (event && event.place && event.place.lat && event.place.lng) {
          return getDistanceFromLatLonInKm(params.lat, params.lng, event.place.lat, event.place.lng) < distance
        }
        return false
      })
    }
    events = events.map((event) => {
      const wantVisit = event.isParticipant(profileId)
      event = event.toJSON()
      event.wantVisit = wantVisit
      return event
    })
    return events
  }

  controller.getFutures = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    const { startDateTimeout } = ctx.config.logic.events
    return Event.find({
      participants: {
        $in: [profileId],
      },
      status: {
        $ne: 'REJECTED',
      },
      startDate: {
        $gte: new Date() - startDateTimeout,
      },
    })
  }
  return controller
}
