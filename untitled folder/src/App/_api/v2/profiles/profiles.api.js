import asyncRouter from 'lego-starter-kit/utils/AsyncRouter' // eslint-disable-line
import getProfileController from './profiles.controller'

export default(ctx, parent) => {
  const { Profile } = ctx.models
  const { wrapResourse, createResourse } = ctx.helpers
  const profileController = getProfileController(ctx, parent)

  let api = asyncRouter();
  // GET
  api.all('/create-avatars', async () => {
    const profiles = await Profile.find()
    const promises = profiles.map(profile => {
      return profile.saveResizedAvatars()
    })
    return Promise.all(promises)
  })
  api.all('/create-defaults-avatars', async () => {
    return Profile.createDefaultAvatars()
  })
  api.all('/reset-avatars', async () => {
    const profiles = await Profile.find()
    const promises = profiles.map(profile => {
      if (profile.avatar.indexOf('http://') >= 0) {
        profile.avatar = '/storage/default-avatar.png'
      }
      return profile.save()
    })
    return Promise.all(promises)
  })
  api.all('/filter', profileController.filter)

  // RECOVERY
  api.post('/recovery', profileController.recovery)
  api.get('/validate', profileController.validate)
  // DEVICE
  api.post('/device', profileController.setDevice)
  api.get('/device', profileController.getDevice)
  api.delete('/device', profileController.deleteDevice)
  //
  api.get('/coordinates/:id', profileController.getCoordinates)
  api.get('/', profileController.getMe)
  api.get('/favorite', profileController.getMyJays)
  api.get('/list', profileController.getList)
  api.get('/map', profileController.getMap)
  api.get('/future', profileController.getFutures)
  api.get('/future/all', profileController.getAllFutures)
  // POST
  api.post('/coordinates', profileController.setCoordinates)
  api.post('/', profileController.create)
  api.post('/remove', profileController.remove)
  // PUT
  api.put('/', profileController.updateMe)
  // ALL
  api.all('/near', profileController.findNearestUsers)
  api.all('/new', profileController.getNew)
  // TESTS
  api.get('/get/all', async() => {
    return Profile.find()
  })
  api.delete('/:id', () => {}) // Удалить
  api.get('/:id', profileController.getProfile)
  // Заглушки
  api = wrapResourse(createResourse(Profile), { api })

  return api
}
