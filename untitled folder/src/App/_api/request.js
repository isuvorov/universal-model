import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
const _userId = '57cd52a7ffeddc341d31bfc6' // Типо авторизованный пользователь

export default (ctx, parent) => {
  const { Profile, Request } = ctx.models
  const { wrapResourse, createResourse } = ctx.helpers

  const api = wrapResourse(createResourse(Profile), {
    prefix: '/profiles',
  })

  // GET
  api.get('/:id', async(req) => {
    return Profile.check(req.params.id)
  })
  // POST
  api.post('/', async(req) => {
    const params = req.allParamas()
    const request = new Request(params)
    return request.save()
  })
  return api
}
