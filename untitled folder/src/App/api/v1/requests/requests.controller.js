import getPlaceApi from '../../v1/place/place.api'
import _ from 'lodash'
function startDateNull (object) {
  object.startDate = null
  return object
}
export default(ctx) => {
  const { Profile, Request } = ctx.models

  const { e400 } = ctx.errors
  const { checkNotFound, isAuth } = ctx.helpers
  const placeApi = getPlaceApi()
  // const { wrapResourse, createResourse } = ctx.helpers

  const controller = {}
  // СОЗДАТЬ REQUEST
  controller.create = async function add(req) {
    isAuth(req)
    const { to, help, place, startDate } = req.allParams()
    const from = req.user._id
    if (!from) {
      throw e400('Не указан параметр from')
    }
    if (!to) {
      throw e400('Не указан параметр to')
    }
    if (!help) {
      throw e400('Не указан параметр help')
    }
    if (from === to) {
      throw e400('Нельзя отправлять самому себе')
    }
      //  await Profile.findById(from).then(checkNotFound)
    await Profile.findById(to).then(checkNotFound)
    const myProfile = await Profile.findById(from).then(checkNotFound)
    const lastRequest = await myProfile.getLastRequest(to)
    if (lastRequest) {
      throw e400('Существует 1 или больше встреч между пользователями, на которые не было ответа')
    }
    if (help === 'help_you') {
      if (!startDate) {
        throw e400('Не указан параметр startDate')
      }
      if (!place) {
        throw e400('Не указан параметр place')
      }
    }
    const params = {
      from,
      to,
      help,
      place,
      startDate,
    }
    if (place) {
      if (help === 'help_me') {
        params.place = null
      }
      if (help === 'help_you') {
        const _place = await placeApi.get(place)
        params.place = _place
      }
    } else {
      params.place = null
    }
    let request = new Request(params)
    request = await request.save()
    const toProfile = await Profile.findById(to).then(checkNotFound)
    const fromProfile = await Profile.findById(from).then(checkNotFound)
    if (help === 'help_you') {
      fromProfile.askHelp = request._id
      await fromProfile.save()
    }
    if (help === 'help_me') {
      toProfile.offerHelp = request._id
      await toProfile.save()
    }
    // PUSH BEGIN
    if (help === 'help_me') {
      toProfile.notify('msg1', {
        fromProfile,
        toProfile,
        request,
      })
    }
    if (help === 'help_you') {
      toProfile.notify('msg4', {
        fromProfile,
        toProfile,
        request,
      })
    }
    // PUSH END
    return request
  }

  controller.get = async (req) => {
    isAuth(req)
    try {
      const profileId = req.user._id
      const params = req.allParams()
      let findParams = {}
      if (params.help) {
        findParams.help = params.help
      }
      findParams.from = {
        $ne: null,
      }
      findParams.to = {
        $ne: null,
      }
      if (params.dir) {
        if (params.dir === 'from_me') {
          findParams.from.$in = [profileId]
        }
        if (params.dir === 'to_me') {
          findParams.to.$in = [profileId]
        }
      } else {
        findParams.from.$in = [profileId]
        findParams.to.$in = [profileId]
      }
      if (params.status) {
        findParams.status = params.status.split(',')
      } else {
        findParams.status = {
          $in: ['ACCEPTED', 'REVIEW'],
        }
      }
      findParams = {
        $or: [findParams],
      }
      if (!params.dir) {
        findParams = {
          $or: [
            _.omit(findParams.$or[0], ['from']),
            _.omit(findParams.$or[0], ['to']),
          ],
        }
      }
      if (params.from) {
        findParams.$or = findParams.$or.map(findParam => {
          if (!findParam.startDate) {
            findParam.startDate = {}
          }
          findParam.startDate.$gte = new Date(params.from)
          return findParam
        })
      }
      if (params.to) {
        findParams.$or = findParams.$or.map(findParam => {
          if (!findParam.startDate) {
            findParam.startDate = {}
          }
          findParam.startDate.$lte = new Date(params.to)
          return findParam
        })
      }
      if (params.from || params.to) {
        findParams.$or.forEach(findParam => {
          findParams.$or.push(
            Object.assign({}, findParam, {
              startDate: null,
            })
          )
        })
      }
      let requests = await Request
      .find(findParams)
      .populate('from')
      .populate('to')
      requests = requests.filter((request) => {
        return request.to && request.from
      })
      return requests.map((request) => {
        const from = request.from.toJSON()
        const to = request.to.toJSON()
        request = request.toJSON()
        request.from = from
        request.to = to
        return request
      })
    } catch (err) {
      throw err
    }
  }

  controller.update = async function add(req) {
    isAuth(req)
    const params = req.allParams()
    const request = await Request.findById(params.id).then(checkNotFound)
    const profileId = req.user._id
    const profile = await Profile.findById(profileId).then(checkNotFound)
    const { from, to } = request
    if (request.status === 'REJECTED') {
      return request
    }
    if (!request.isParticipant(profileId)) {
      return request
    }
    if (params.place) {
      const _place = await placeApi.get(params.place)
      params.place = _place
    }
    if (params.place || params.startDate) {
      params.status = 'REVIEW'
      if (to.toString() === profileId) {
        const toId = to
        const fromId = from || null
        params.from = toId
        params.to = fromId
      }
    }
    await Request.findByIdAndUpdate(params.id, params, { new: true })
    // PUSH BEGIN
    if (params.place || params.startDate) {
      const toProfile = await Profile.findById(request.to).then(checkNotFound)
      const fromProfile = await Profile.findById(request.from).then(checkNotFound)
      let _profile = null
      if (profile._id.toString() !== to.toString()) {
        _profile = toProfile
      }
      if (profile._id.toString() !== from.toString()) {
        _profile = fromProfile
      }
      _profile.notify('msg12', { request, profile })
    }
    return Request.findById(params.id)
    // PUSH END
  }

  controller.confirm = async function confirm(req) {
    const params = req.allParams()
    const id = params.id
    if (!id) {
      throw e400('Не передан id')
    }
    let request = await Request.findById(id).then(checkNotFound)
    if (request.help === 'help_me') {
      const { place, startDate } = params
      if (place) {
        params.place = await placeApi.get(place)
      }
      if (startDate) {
        params.startDate = startDate
      }
    }
    request._confirm(params)
    if (!request.place) {
      throw e400('Не определенно место встречи')
    }
    if (!request.startDate) {
      throw e400('Не определенно место встречи')
    }
    request = await request.save()
    // PUSH BEGIN
    const toProfile = await Profile.findById(request.to).then(checkNotFound)
    const fromProfile = await Profile.findById(request.from).then(checkNotFound)
    if (request.help === 'help_me') {
      fromProfile.notify('msg2', { request, toProfile, fromProfile })
    }
    if (request.help === 'help_you') {
      fromProfile.notify('msg5', { request, toProfile, fromProfile })
    }
    // PUSH END
    return request
  }

  controller.rejectAcceptedRequest = async function(req) {
    isAuth(req)
    const requestId = req.allParams().id
    const profileId = req.user._id
    let request = await Request.findById(requestId).then(checkNotFound)
    if (request.from.toString() == profileId || request.to.toString() == profileId) {
      const profile = await Profile.findById(profileId).then(checkNotFound)
      request._reject()
      request = await request.save()
      // PUSH BEGIN
      let _profileId = null
      if (request.from != profileId) {
        _profileId = request.from
      }
      if (request.to != profileId) {
        _profileId = request.to
      }
      const _profile = await Profile.findById(_profileId).then(checkNotFound)
      _profile.notify('msg11', { request, profile })
      // PUSH END
      return request
    }
    else {
      return request
    }
  }

  controller.reject = async function reject(req) {
    isAuth(req)
    // const profileId = req.user._id
    const requestId = req.allParams().id
    let request = await Request.findById(requestId).then(checkNotFound)
    if (request.status === 'ACCEPTED') return controller.rejectAcceptedRequest(req)
    request._reject()
    request = await request.save()

    const toProfile = await Profile.findById(request.to).then(checkNotFound)
    const fromProfile = await Profile.findById(request.from).then(checkNotFound)
    if (request.help === 'help_me') {
      fromProfile.notify('msg3', { request, toProfile, fromProfile })
    }
    if (request.help === 'help_you') {
      fromProfile.notify('msg6', { request, toProfile: fromProfile, fromProfile: toProfile })
    }
    return request
  }

  controller.getList = async function reject(req) {
    isAuth(req)
    const profileId = req.user._id
    // НАЙТИ ВСЕ ЗАПРОСЫ КО МНЕ, КОТОРЫЕ НЕ REJECTED
    let requests = await Request.find({
      to: profileId,
      status: 'REVIEW',
    })
    .populate('from')
    .populate('to')
    requests = requests.map((request) => {
      const _request = request.toJsonForProfile(profileId)
      return _request
    })
    return requests
  }

  return controller
}
