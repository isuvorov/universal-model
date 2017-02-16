import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
import getRequestsController from './requests.controller'


export default (ctx, parent) => {
  const { Request } = ctx.models.v2
  const { wrapResourse, createResourse } = ctx.helpers
  // const { ProfileController } = ctx.resourses
  let api = asyncRouter();
  const requestsController = getRequestsController(ctx, parent)

  // GET
  api.get('/', requestsController.get)
  // СОЗДАТЬ
  api.post('/', requestsController.create)
  api.put('/:id', requestsController.update)
  // ПОДТВЕРДИТЬ
  // api.post('/confirm', requestsController.confirm)
  api.all('/:id/confirm', requestsController.confirm)
  api.post('/:id/unsafeConfirm', requestsController.unsafeConfirm)
  // ОТКЛОНИТЬ
  // api.post('/reject', requestsController.reject)
  api.all('/:id/reject', requestsController.reject)
  // СПИСОК
  api.get('/list', requestsController.getList)
  api.get('/get/all', () => {
    return Request.find()
  })
  // Заглушки
  api.delete('/:id', () => {})

  api = wrapResourse(createResourse(Request), { api })

  return api
}
