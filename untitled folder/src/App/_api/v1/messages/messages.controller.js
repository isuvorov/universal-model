import getMailer from '../../mailer'
import _ from 'lodash'
export default (ctx) => {
  const { isAuth, _checkNotFound } = ctx.helpers
  const { e400 } = ctx.errors
  const { Message } = ctx.models
  const controller = {}

  controller.get = async (req) => {
    isAuth(req)
    const params = req.allParams()
    const profileId = req.user._id
    let findParams = {}
    if (params.dir === 'from_me') {
      findParams.from = profileId
    }
    if (params.dir === 'to_me') {
      findParams.to = profileId
    }
    if (params.to) {
      findParams.to = params.to
    }
    if (params.to) {
      findParams.from = params.to
    }
    if (!findParams.from && !findParams.to) {
      findParams = {
        $or: [
          Object.assign(_.clone(findParams), { to: profileId }),
          Object.assign(_.clone(findParams), { from: profileId }),
        ],
      }
    }
    let messages = await Message
    .find()
    .populate('from')
    .populate('to')
    messages = messages.filter(message => {
      return message.from && message.to
    })
    return messages
    // return messages.map(message => {
    //   const from = message.from.toJSON()
    //   const to = message.to.toJSON()
    //   message.from = from
    //   message.to = to
    //   return message.toJSON()
    // })
  }

  controller.send = async (req) => {
    isAuth(req)
    const params = req.allParams()
    const profileId = req.user._id
    params.from = profileId
    const message = new Message(params)
    return message.save()
  }

  controller.publish = async (req) => {
    const params = req.allParams()
    return Message.publish(params)
  }

  return controller
}
