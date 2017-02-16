import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
import fileUpload from 'express-fileupload'
import _ from 'lodash'

import getAuthApi from './auth/auth.api'
import getProfilesApi from './profiles/profiles.api.js'
import getRequestsApi from './requests/requests.api.js'
import getEventsApi from './events/events.api.js'
import getPlacesApi from './place/place.api.js'
import getReportApi from './report/report.api.js'
import getAbuseApi from './abuse/abuse.api.js'
import getNotificationApi from './notifications/notifications.api'
import getMessagesApi from './messages/messages.api'
import getDocs from './getDocs'
import fs from 'fs'
// import nodemailer from 'nodemailer'

export default function getApi(ctx, params) {
  const api = asyncRouter()

  api.use('/requests', getRequestsApi(ctx, params))
  api.use('/profiles', getProfilesApi(ctx, params))
  api.use('/events', getEventsApi(ctx, params))
  api.use('/report', getReportApi(ctx, params))
  api.use('/abuse', getAbuseApi(ctx, params))
  api.use('/notifications', getNotificationApi(ctx, params))
  api.use('/messages', getMessagesApi(ctx, params))
  api.use('/', getAuthApi(ctx, params))
  api.post('/complain', async(req) => {
    return req.allParams()
  })
  
  const placeApi = getPlacesApi(ctx)
  api.get('/places', (req) => {
    return placeApi.get()
  })
  api.get('/places/list', async(req) => {
    const _params = req.allParams()
    const { lat, lng, search } = _params
    return placeApi.search({ lat, lng, query: search })
  })
  api.get('/places/:id', (req) => {
    const _params = req.allParams()
    return placeApi.get(_params.id)
  })

  api.post('/test/push', (req) => {
    let devices = []
    const _params = req.allParams()
    if (_params.devices) {
      devices = _params.devices
    }
    if (_params.device) {
      devices = [_params.device]
    }
    return ctx.sendPush(devices, _.omit(_params, ['devices', 'device']))
  })

  api.all('/test/push/:type', async (req) => {
    ctx.helpers.isAuth(req)
    const pushParams = req.allParams()
    const profile = await ctx.models.Profile.findById(req.user._id).then(checkNotFound)
    return profile.testNotify(pushParams.type)
  })

  api.post('/push', async (req) => {
    const params = req.allParams()
    const { text } = params
    if (!text) throw e400('text is not found')
    const profiles = await Profile.find()
    const promises = profiles.map((profile) => {
      return profile.notify('msg18', { text })
    })
    await Promise.all(promises)
    return { status: 'success', params }
  })

  api.get('/isonline/:id', async (req) => {
    const params = req.allParams()
    const { id } = params
    return { isOnline: ctx.onlineMap.isOnline(id) }
  })

  api.all('/telegram', async (req) => {
    const params = req.allParams()
    try {
      const error = JSON.stringify(params, null, 4)
      return ctx.TelegramBot.sendMessage('1227280', error)
    } catch (err) {
      return null
    }
  })

  api.all('*', () => {
    return {
      code: 404,
      message: 'Api method not found',
    }
  })


  return api;
}
