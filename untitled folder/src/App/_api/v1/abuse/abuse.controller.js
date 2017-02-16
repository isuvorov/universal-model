export default (ctx) => {
  const { checkNotFound, isAuth } = ctx.helpers
  const { Profile, Event, AbuseProfile, AbuseEvent, Abuse } = ctx.models
  const controller = {}

  controller.user = async function(req) {
    isAuth(req)
    const params = req.allParams()
    const text = params.text
    const profileId = params.id
    const profile = await Profile.findById(profileId).then(checkNotFound)
    const abuseProfile = new AbuseProfile({ profile, text, user: req.user._id })
    return abuseProfile.save()
  }

  controller.event = async function(req) {
    isAuth(req)
    const params = req.allParams()
    const text = params.text
    const eventId = params.id
    const event = await Event.findById(eventId).then(checkNotFound)
    const abuseEvent = new AbuseEvent({ event, text, user: req.user._id })
    return abuseEvent.save()
  }
  controller.test = async function(req) {
    return Abuse.find()
  }

  return controller
}
