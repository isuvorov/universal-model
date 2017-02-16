export default (ctx) => {
  const { isAuth, _checkNotFound } = ctx.helpers
  const { e400 } = ctx.errors
  const { Request } = ctx.models.v2
  const { Profile } = ctx.models
  const controller = {}

  controller.getCount = async (req) => {
    isAuth(req)
    const profile = await Profile.findById(req.user._id)
    .then(_checkNotFound('Profile'))
    return profile.getNotifications()
  }

  controller.readRequest = async () => {
    return {
      status: 'success',
    }
    // isAuth(req)
    // const params = req.allParams()
    // const { id } = params
    // const request = await Request.findById(id).then(checkNotFound)
  }
  controller.readEvent = async () => {
    return {
      status: 'success',
    }
    // isAuth(req)
    // const params = req.allParams()
    // const { id } = params
    // const request = await Request.findById(id).then(checkNotFound)
  }
  controller.readMessages = async (req) => {
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

  return controller
}
