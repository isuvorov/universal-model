import asyncRouter from 'lego-starter-kit/utils/AsyncRouter' // eslint-disable-line
import getController from './messages.controller'

export default(ctx, parent) => {
  const { Message } = ctx.models
  const { wrapResourse, createResourse } = ctx.helpers
  const controller = getController(ctx, parent)

  let api = asyncRouter();
  api.get('/get/all', async () => Message.find())
  return api
}
