import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
import getController from './abuse.controller'
export default (ctx) => {
  const api = asyncRouter();
  const controller = getController(ctx)
  api.all('/user/:id', controller.user)
  api.all('/event/:id', controller.event)
  api.all('/test', controller.test)
  // Заглушки
  api.delete('/:id', () => {})
  return api
}
