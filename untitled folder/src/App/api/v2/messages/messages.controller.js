export default (ctx) => {
  const { isAuth, _checkNotFound } = ctx.helpers
  const { e400 } = ctx.errors
  const { Message, Profile } = ctx.models
  const controller = {}

  controller.readAll = async function() {
    const messages = await Message.find()
    const promises = messages.map(message => {
      message.status = 'READ'
      return message.save()
    })
    return Promise.all(promises)
  }

  controller.readMessagesFromProfile = async function(req) {
    isAuth(req)
    const params = req.allParams()
    const { id } = params
    const profileId = req.user._id
    const profile = await Profile.findById(profileId)
    profile.readAllMessagesFromProfile(id)
    return {
      status: 'success'
    }
  }
  controller.getGeneralMessages = async function(req) {
    const { from, to } = req.allParams()
    return Message.find({
      $or: [
        {
          from, to,
        },
        {
          from: to, to: from,
        }
      ]
    })
  }

  return controller
}
