import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
import getController from './admin.controller'
import getProfilesApi from '../profiles/profiles.api'
import getRequestsApi from '../requests/requests.api'
// import getProfilesApi from './profiles/profiles.api'

export default (ctx) => {
  const { e400, e403 } = ctx.errors

  const api = asyncRouter();
  const controller = getController(ctx)
  const { wrapResourse, createResourse } = ctx.helpers
  const { Profile, Event } = ctx.models
  const { Request } = ctx.models.v2

  async function isAdmin(req) {
    if (!req.user || !req.user._id) {
      throw e400('!Auth')
    }
    const user = await Profile.findById(req.user._id)
    if (user.socialNetworkType !== 'vk' || user.linkToSocialNetwork !== '40657') {
      throw e403('!Admin')
    }
  }

  api.all('/test', isAdmin, () => {
    return { admin: true }
  })
  api.all('/login', controller.login)
  api.get('/profiles/stats', isAdmin, controller.getProfileStats)
  api.get('/requests/stats', isAdmin, controller.getRequestStats)
  api.get('/events/stats', isAdmin, controller.getEventStats)
  api.delete('/profiles/:id', isAdmin, controller.deleteProfile)
  // api.use('/profiles', getProfilesApi(ctx))
  // api.use('/requests', getRequestsApi(ctx))
  // api.use('/events',+ getEventsApi(ctx))
  api.use('/events', isAdmin, ctx.services.AdminCrudWrapper(Event))
  api.use('/requests', isAdmin, ctx.services.AdminCrudWrapper(Request))
  api.use('/profiles', isAdmin, ctx.services.AdminCrudWrapper(Profile))
  return api
}
