import getMailer from '../../mailer'
export default (ctx) => {
  const mailer = getMailer(ctx)
  const { e400 } = ctx.errors
  const { Report, Profile } = ctx.models
  const { isAuth, _checkNotFound } = ctx.helpers
  const controller = {}

  controller.report = async (req) => {
    try {
      isAuth(req)
      const params = req.allParams()
      return params
      const fields = ['reply']
      for (const field of fields) {
        if (params[field] == null) {
          throw e400(`field ${field} is not found`)
        }
      }
      const { cc, reply } = params
      const text = params.text || params.message
      if (!text) {
        throw e400('field text is not found')
      }
      // const to = 'shitric2@gmail.com'
      const to = ctx.config.mail.report || 'shitric2@gmail.com'
      const profile = await Profile.findById(req.user._id)
      .then(_checkNotFound('Profile'))
      let reportMessage =
      `От: ${profile.name}
email пользователя: ${profile.email}
ID пользователя: ${profile._id}
Сообщение: ${text}`
      if (params.os) {
        reportMessage += `\nOS: ${params.os}`
      }
      if (params.phone_model) {
        reportMessage += `\nМодель телефона: ${params.phone_model}`
      }
      const subject = params.subject || 'Report'
      const toParams = { to, text: reportMessage, subject }
      const replyParams = { to: reply, text: Report.getReplyMessage(profile.nativeLanguage), subject }
      let mails = []
      mails[0] = mailer.sendMail(toParams)
      mails[1] = mailer.sendMail(replyParams)
      if (cc) {
        const ccParams = replyParams
        ccParams.to = cc
        mails[2] = mailer.sendMail(ccParams)
      }
      let profileId = null
      if (req.user && req.user._id) {
        profileId = req.user._id
      }
      mails = await Promise.all(mails)
      await Report.create({ logs: mails, profileId, text })
      return { mails }
      // return { to, text, cp, reply, subject }
    } catch (err) {
      console.error(err)
      return { err }
    }
  }

  return controller
}
