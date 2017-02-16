export default (ctx) => {
  const { Profile } = ctx.models
  const { e401, e400, e404, e500 } = ctx.errors // eslint-disable-line
  const { isAuth, _checkNotFound } = ctx.helpers

  const controller = {}

  controller.getList = async(req) => {
    isAuth(req)
    const profileId = req.user._id
    const profile = await Profile.findById(profileId).then(_checkNotFound('Profile'))
    const params = req.allParams()
    params.limit = params.limit || 500
    params.offset = params.offset || 0
    params.lat = params.lat || profile.lat
    params.lng = params.lng || profile.lng
    params.distance = params.distance || 10000
    return profile.filter(params)
  }
  return controller
}
