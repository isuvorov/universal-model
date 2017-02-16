import asyncRouter from 'lego-starter-kit/utils/AsyncRouter' // eslint-disable-line
import getEventController from './events.controller'

export default (ctx, parent) => {
  const { Event } = ctx.models
  const { wrapResourse, createResourse } = ctx.helpers
  const eventController = getEventController(ctx, parent)
  let api = asyncRouter();
  // API
  // GET
  api.get('/future', eventController.getFutures)
  api.get('/list', eventController.getList)
  api.get('/test', eventController.test)
  api.get('/:id', eventController.get)
  // POST
  api.post('/', eventController.create)
  api.post('/:id/visit', eventController.visit)
  api.post('/:id/leave', eventController.leave)
  api.post('/:id/reject', eventController.reject)
  // PUT
  api.put('/:id', eventController.update)
  // Заглушки
  // api.delete('/:id', () => {})
  api = wrapResourse(createResourse(Event), { api })

  return api
}
