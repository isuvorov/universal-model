import moment from 'moment'
export default (ctx) => {
  const { isAuth, _checkNotFound } = ctx.helpers
  const { e400 } = ctx.errors
  const { Message, Profile, Event } = ctx.models
  const { Request } = ctx.models.v2
  const controller = {}

  controller.login = async function(req) {
    const params = req.allParams()
    const { password, login } = params
    console.log(params, req.user)
    let profile = null
    if (req.user) {
      profile = await Profile.findById(req.user._id)
    } else {
      if (password === 'hijay_password' && login.toLowerCase() === 'admin') {
        profile = await Profile.findOne({
          linkToSocialNetwork: '40657',
          socialNetworkType: 'vk',
          deleted: false,
        })
        if (!profile) {
          return e400('Bad login')
        }
      }
    }
    console.log({ profile })
    if (profile) {
      return {
        user: profile,
        token: profile.generateAuthToken(),
      }
    }
    throw e400('Bad login')
  }

  controller.getProfileStats = async function() {
    const profiles = await Profile.find()
    let ios = 0
    let android = 0
    const { profiles_today, profiles_week, profiles_month, profiles_year } = await Promise.props({
      profiles_today: Profile.count({
        createdAt: {
          $gte: moment().startOf('day').format(),
          $lte: moment().endOf('day').format(),
        },
      }),
      profiles_week: Profile.count({
        createdAt: {
          $gte: moment().startOf('week').format(),
          $lte: moment().endOf('week').format(),
        },
      }),
      profiles_month: Profile.count({
        createdAt: {
          $gte: moment().startOf('month').format(),
          $lte: moment().endOf('month').format(),
        },
      }),
      profiles_year: Profile.count({
        createdAt: {
          $gte: moment().startOf('year').format(),
          $lte: moment().endOf('year').format(),
        },
      }),
    })
    profiles.forEach(profile  => {
      if (profile && Array.isArray(profile.devices)) {
        profile.devices.forEach(device => {
          if (device.type === 'ios') {
            ios += 1
          }
          if (device.type === 'android') {
            android += 1
          }
        })
      }
    })
    const response = {
      profiles,
      profiles_all: profiles.length,
      profiles_online: profiles.filter(profile => profile.isOnline).length,
      profiles_today,
      profiles_week,
      profiles_month,
      profiles_year,
      devices: {
        ios,
        android,
      }
    }
    return response
  }

  controller.getRequestStats = async function() {
    const requests = await Request.count()
    const { requests_today, requests_week, requests_month } = await Promise.props({
      requests_today: Request.count({
        createdAt: {
          $gte: moment().startOf('day').format(),
          $lte: moment().endOf('day').format(),
        },
      }),
      requests_week: Request.count({
        createdAt: {
          $gte: moment().startOf('week').format(),
          $lte: moment().endOf('week').format(),
        },
      }),
      requests_month: Request.count({
        createdAt: {
          $gte: moment().startOf('month').format(),
          $lte: moment().endOf('month').format(),
        },
      }),
    })
    const response = {
      requests_all: requests,
      requests_today,
      requests_week,
      requests_month,
    }
    return response
  }
  controller.getEventStats = async function() {
    const events = await Event.find()
    const { events_today, events_week, events_month } = await Promise.props({
      events_today: Event.count({
        createdAt: {
          $gte: moment().startOf('day').format(),
          $lte: moment().endOf('day').format(),
        },
      }),
      events_week: Event.count({
        createdAt: {
          $gte: moment().startOf('week').format(),
          $lte: moment().endOf('week').format(),
        },
      }),
      events_month: Event.count({
        createdAt: {
          $gte: moment().startOf('month').format(),
          $lte: moment().endOf('month').format(),
        },
      }),
    })
    const response = {
      events_all: events.length,
      events_today,
      events_week,
      events_month,
    }
    return response
  }

  controller.deleteProfile = async (req) => {
    const params = req.allParams()
    const profile = await Profile.findById(params.id)
    profile.deleted = true
    return profile.save()
  }

  return controller
}
