import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
import getController from './messages.controller'
export default (ctx) => {
  const api = asyncRouter();
  const { Message } = ctx.models
  const controller = getController(ctx)
  api.get('/read/all', controller.readAll)
  api.post('/read/:id', controller.readMessagesFromProfile)
  api.get('/get/:from/:to', controller.getGeneralMessages)

  return api
}
