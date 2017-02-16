export default (ctx) => {
  const { Profile } = ctx.models
  const { e400 } = ctx.errors
  const controller = {}

  controller.authenticate = async function (req) {
    const params = req.allParams()
    if (params.socialNetworkType === 'local') {
      return controller.authenticateByLocal(req)
    }
    return controller.authenticateBySocialNetwork(req)
  }

  controller.authenticateBySocialNetwork = async function(req) {
    const params = req.allParams()
    const secret = (ctx.config.clientSecret)
    if (params.secret !== secret) {
      throw ctx.errors.e(422, 'unsupported version')
    }
    if (!params.linkToSocialNetwork) {
      throw ctx.errors.e400('!linkToSocialNetwork')
    }
    if (!params.socialNetworkType) {
      throw ctx.errors.e400('!socialNetworkType')
    }
    const existProfile = await Profile.findOne({
      linkToSocialNetwork: params.linkToSocialNetwork,
      socialNetworkType: params.socialNetworkType,
      deleted: false,
    })
    if (existProfile) {
      return {
        __pack: 1,
        result: 'success',
        profile: existProfile,
        token: existProfile.generateAuthToken(),
      }
    }
    return { result: 'failed', reason: 'profile not found' }
  }

  controller.authenticateByLocal = async function(req) {
    const params = req.allParams()
    const fields = [
      'password',
      'email',
      'socialNetworkType',
    ]
    for (const field of fields) {
      if (!params[field]) {
        throw e400(`param ${field} is not found`)
      }
    }
    const { email, password, socialNetworkType } = params
    const profile = await Profile.findOne({
      email: email.toLowerCase(),
      socialNetworkType,
      deleted: false,
    })
    if (!profile) {
      return {
        result: 'failed',
        reason: "user doesn't found",
      }
    }
    const login = await profile.verifyPassword(password)
    if (!login) {
      return {
        result: 'failed',
        reason: "password doesn't match",
      }
    }
    return {
      result: 'success',
      profile,
      token: profile.generateAuthToken(),
    }
  }

  return controller
}
