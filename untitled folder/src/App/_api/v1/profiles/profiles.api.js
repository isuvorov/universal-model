import asyncRouter from 'lego-starter-kit/utils/AsyncRouter' // eslint-disable-line
import getProfileController from './profiles.controller'

export default(ctx, parent) => {
  const { Profile } = ctx.models
  const { wrapResourse, createResourse } = ctx.helpers
  const profileController = getProfileController(ctx, parent)

  let api = asyncRouter();
  // GET


  // DEVICE
  api.post('/device', profileController.setDevice)
  api.get('/device', profileController.getDevice)
  api.delete('/device', profileController.deleteDevice)
  //
  api.get('/coordinates/:id', profileController.getCoordinates)
  api.get('/', profileController.getMe)
  api.get('/favorite', profileController.getMyJays)
  api.get('/list', profileController.getList)
  api.get('/future', profileController.getFutures)
  api.get('/future/all', profileController.getAllFutures)
  // POST
  api.post('/coordinates', profileController.setCoordinates)
  api.post('/', profileController.create)
  // PUT
  api.put('/', profileController.updateMe)
  // ALL
  api.all('/near', profileController.findNearestUsers)
  api.all('/new', profileController.getNew)
  // TESTS
  api.get('/get/all', async() => {
    return Profile.find()
  })
  api.get('/:id', profileController.getProfile)
  // Заглушки
  api.delete('/:id', () => {})
  api = wrapResourse(createResourse(Profile), { api })

  return api
}
