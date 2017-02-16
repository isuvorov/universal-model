import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
import getController from './notifications.controller'
export default (ctx, parent) => {
  const api = asyncRouter();
  const controller = getController(ctx)
  api.get('/count', controller.getCount)
  api.all('/read/request/:id', controller.readRequest)
  api.all('/read/event/:id', controller.readEvent)
  api.all('/message/:id', controller.readMessages)
  return api
}
