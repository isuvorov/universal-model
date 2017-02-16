import getPlaceApi from '../../v1/place/place.api'
import _ from 'lodash'
export default(ctx) => {
  const { Request } = ctx.models.v2
  const { Profile } = ctx.models

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
      reviewer: to,
      sender: from,
    }
    if (place) {
      if (help === 'help_me') {
        params.place = null
      }
      if (help === 'help_you') {
        const _place = await placeApi.get(place)
        if (!_place) {
          throw e400(`place width id = ${params.place} is not found`)
        }
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
        fromProfileId: fromProfile.id,
        toProfileId: toProfile.id,
        requestId: request.id,
      })
      toProfile.notifyEmail('request_meeting_help_me', {
        request, profile: fromProfile.toJSON(),
      })
    }
    if (help === 'help_you') {
      toProfile.notify('msg4', {
        fromProfile,
        toProfile,
        request,
        fromProfileId: fromProfile.id,
        toProfileId: toProfile.id,
        requestId: request.id,
      })
      toProfile.notifyEmail('request_meeting_help_you', {
        request, profile: fromProfile.toJSON(),
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
        if (request.sender &&
        request.to && request.to.id &&
        request.sender.toString() === request.to.id.toString()) {
          const _to = request.to
          request.to = request.from
          request.from = _to
        }
        delete request.sender
        return request
      })
    } catch (err) {
      throw err
    }
  }

  controller.unsafeConfirm = async function (req) {
    isAuth(req)
    const params = req.allParams()
    if (params.place || params.startDate) {
      return controller.update(req)
    }
    return controller.confirm(req)
  }

  controller.update = async function add(req) {
    isAuth(req)
    const params = req.allParams()
    _.omit(params, ['id', 'place', 'startDate'])
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
      if (!_place) {
        throw e400(`place width id = ${params.place} is not found`)
      }
      params.place = _place
    }
    // Запрещаем назначать время и встречу тому, кто создал запрос help_me
    // до того, как ответил другой юзер
    if (request.reviewer && request.reviewer.toString() !== profileId
        && request.help === 'help_me'
        && (!request.place || !request.startDate)
    ) {
      return request
    }
    // Если отвечает получатель, то он должен передать время и место, если их еще нет
    if (request.reviewer && request.reviewer.toString() === profileId
        && request.help === 'help_me'
        && (!request.startDate && !request.place)
        && (!params.place || !params.startDate)
    ) {
      throw e400('Not found place or startDate')
    }

    if (params.place || params.startDate) {
      params.status = 'REVIEW'
      if (to.toString() === profileId) {
        const toId = to
        const fromId = from || null
        params.from = toId
        params.to = fromId
        params.reviewer = params.to
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
      _profile.notify('msg12', {
        request,
        profile,
        requestId: request.id,
        profileId: profile.id,
      })
    }
    const _request = await Request.findById(params.id)
    if (_request.sender && _request.to && _request.sender.toString() === _request.to.toString()) {
      const _to = _request.to
      _request.to = _request.from
      _request.from = _to
    }
    return _request
    // PUSH END
  }

  controller.confirm = async function confirm(req) {
    isAuth(req)
    const params = req.allParams()
    const id = params.id
    const profileId = req.user._id
    if (!id) {
      throw e400('Не передан id')
    }
    let request = await Request.findById(id).then(checkNotFound)
    if (request.reviewer && request.reviewer.toString() !== profileId) {
      throw e400("You can't accept this request")
    }
    if (!request.startDate) {
      throw e400('Не назначено время встречи')
    }
    if (!request.place) {
      throw e400('Не назначено место встречи')
    }
    request._confirm()
    request.reviewer = request.to
    request = await request.save()
    // PUSH BEGIN
    const toProfile = await Profile.findById(request.to).then(checkNotFound)
    const fromProfile = await Profile.findById(request.from).then(checkNotFound)
    fromProfile.notifyEmail('meeting_confirmited', {
      request, profile: toProfile.toJSON(),
    })
    if (request.help === 'help_me') {
      fromProfile.notify('msg2', {
        request,
        fromProfile,
        toProfile,
        fromProfileId: fromProfile.id,
        toProfileId: toProfile.id,
        requestId: request.id,
      })
    }
    if (request.help === 'help_you') {
      fromProfile.notify('msg5', {
        request,
        toProfile,
        fromProfile,
        fromProfileId: fromProfile.id,
        toProfileId: toProfile.id,
        requestId: request.id,
      })
    }
    // PUSH END
    if (request.sender && request.to && request.sender.toString() === request.to.toString()) {
      const _to = request.to
      request.to = request.from
      request.from = _to
    }
    return request
  }

  controller.rejectAcceptedRequest = async function(req) {
    isAuth(req)
    const requestId = req.allParams().id
    const profileId = req.user._id
    let request = await Request.findById(requestId).then(checkNotFound)
    if (request.from.toString() === profileId || request.to.toString() === profileId) {
      const profile = await Profile.findById(profileId).then(checkNotFound)
      request._reject()
      request = await request.save()
      // PUSH BEGIN
      let _profileId = null
      if (request.from.toString() === profileId) {
        _profileId = request.to
      }
      if (request.to.toString() === profileId) {
        _profileId = request.from
      }
      const _profile = await Profile.findById(_profileId).then(checkNotFound)
      _profile.notify('msg11', {
        request,
        profile,
        requestId: request.id,
        profileId: profile.id,
      })
      // Отправка уведомление на Email
      _profile.notifyEmail('meeting_rejected', {
        request, profile: profile.toJSON(),
      })
      // PUSH END
      if (request.sender && request.to && request.sender.toString() === request.to.toString()) {
        const _to = request.to
        request.to = request.from
        request.from = _to
      }
      return request
    } else {
      if (request.sender && request.to && request.sender.toString() === request.to.toString()) {
        const _to = request.to
        request.to = request.from
        request.from = _to
      }
      return request
    }
  }

  controller.reject = async function reject(req) {
    isAuth(req)
    const profileId = req.user._id
    const profile = await Profile.findById(profileId).then(checkNotFound)
    const requestId = req.allParams().id
    let request = await Request.findById(requestId).then(checkNotFound)
    if (request.status === 'ACCEPTED') return controller.rejectAcceptedRequest(req)
    request._reject()
    request = await request.save()

    // const toProfile = await Profile.findById(request.to).then(checkNotFound)
    // const fromProfile = await Profile.findById(request.from).then(checkNotFound)
    const _profileId = request.from.toString() === profileId ? request.to.toString() : request.from.toString()
    const _profile = await Profile.findById(_profileId)
    // Отправка уведомление на Email
    _profile.notifyEmail('meeting_rejected', {
      request, profile: profile.toJSON(),
    })
    if (request.help === 'help_me') {
      _profile.notify('msg3', {
        request,
        profile,
        profileId,
        requestId: request.id,
      })
    }
    if (request.help === 'help_you') {
      _profile.notify('msg6', {
        request,
        profile,
        profileId,
        requestId: request.id,
      })
    }
    if (request.sender && request.to && request.sender.toString() === request.to.toString()) {
      const _to = request.to
      request.to = request.from
      request.from = _to
    }
    return request
  }

  controller.getList = async function reject(req) {
    isAuth(req)
    const profileId = req.user._id
    const { startDateTimeout } = ctx.config.logic.requests
    // НАЙТИ ВСЕ ЗАПРОСЫ КО МНЕ, КОТОРЫЕ НЕ REJECTED
    let requests = await Request.find({
      $or: [
        {
          to: profileId,
          status: 'REVIEW',
          startDate: {
            $gte: new Date() - startDateTimeout,
          },
        },
        {
          to: profileId,
          status: 'REVIEW',
          startDate: null,
        },
      ],
    })
    .populate('from')
    .populate('to')
    .populate('reviewer')
    .populate('sender')
    requests = requests.map((request) => {
      const _request = request.toJsonForProfile(profileId)
      if (_request.to && _request.to.id &&
      _request.sender && _request.sender.id &&
      _request.sender.id.toString() === _request.to.id.toString()) {
        const _to = _request.to
        _request.to = _request.from
        _request.from = _to
      }
      delete _request.sender
      return _request
    }).filter(request => {
      return request.from && request.to
    })
    return requests
  }

  return controller
}
