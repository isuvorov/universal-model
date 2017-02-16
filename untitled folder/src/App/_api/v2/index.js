import getApiV1 from '../v1'
import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
// api
import getRequestApi from './requests/requests.api'
import getProfileApi from './profiles/profiles.api'
import getMessagesApi from './messages/messages.api'
import getAdminApi from './admin/admin.api'

export default function getApiV2(ctx, params) {
  const apiV1 = getApiV1(ctx, params)
  const api = asyncRouter()

  api.use('/requests', getRequestApi(ctx))
  api.use('/profiles', getProfileApi(ctx))
  api.use('/messages', getMessagesApi(ctx))
  api.use('/admin', getAdminApi(ctx))
  // api.all('/email/:type', async(req) => {
  //   const params = req.allParams()
  //   const { email, type } = params
  //   const { MailNotifications } = ctx.services
  //   const [profile, request, event] = await Promise.all([
  //     ctx.models.Profile.findOne(),
  //     ctx.models.v2.Request.findOne(),
  //     ctx.models.Event.findOne(),
  //   ])
  //   if (params.type === 'sign_in') {
  //     return MailNotifications.sendEmail({ to: email }, {
  //       login: 'LOGIN',
  //       password: 'PASSWORD',
  //       type,
  //       profile: profile.toJSON(),
  //       _profile: profile.toJSON(),
  //     })
  //   }
  //   if (params.type === 'meeting_confirmited') {
  //     return MailNotifications.sendEmail({ to: email}, {
  //       request, profile: profile.toJSON(), type, _profile: profile.toJSON(),
  //     })
  //   }
  //   if (params.type === 'request_meeting_help_me') {
  //     return MailNotifications.sendEmail({ to: email}, {
  //       request, profile: profile.toJSON(), type, _profile: profile.toJSON(), language: 'ru',
  //     })
  //   }
  //   if (params.type === 'group_meeting') {
  //     return MailNotifications.sendEmail({ to: email}, {
  //       event, request, profile: profile.toJSON(), type, _profile: profile.toJSON(),
  //     })
  //   }
  //   if (params.type === 'meeting_rejected') {
  //     const request = await ctx.models.Request.findOne()
  //     return profile.notifyEmail(params.type, {
  //       request, profile: profile.toJSON(), jaysCount: 54,
  //     })
  //   }
  //   if (params.type === 'recover_password') {
  //     return profile.notifyEmail(params.type, {
  //       password: 'new password',
  //     })
  //   }
  //   if (params.type === 'request_meeting_help_me') {
  //     const request = await ctx.models.Request.findOne({
  //       help: 'help_me',
  //     })
  //     return profile.notifyEmail(params.type, {
  //       request, profile: profile.toJSON(),
  //     })
  //   }
  //   if (params.type === 'request_meeting_help_you') {
  //     const request = await ctx.models.Request.findOne({
  //       help: 'help_you',
  //     })
  //     // return request
  //     return profile.notifyEmail(params.type, {
  //       request, profile: profile.toJSON(),
  //     })
  //   }
  // })
  api.use(apiV1)
  return api
}
