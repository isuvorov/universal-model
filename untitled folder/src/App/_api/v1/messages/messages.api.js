import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
import getController from './messages.controller'
export default (ctx) => {
  let api = asyncRouter();
  const controller = getController(ctx)
  const { wrapResourse, createResourse } = ctx.helpers
  const { Message } = ctx.models
  // Найти все мои сообщения

  api.get('/', controller.get)
  // Найти все сообщения между мной и другим юзером
  api.get('/profile/:id', controller.getByProfile)
  // Отправить сообщение
  api.post('/', controller.send)
  api.post('/publish', controller.publish)

  api = wrapResourse(createResourse(Message), { api })

  return api
}
