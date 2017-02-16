import asyncRouter from 'lego-starter-kit/utils/AsyncRouter' // eslint-disable-line
import getController from './profiles.controller'

export default(ctx, parent) => {
  // const { Profile } = ctx.models
  // const { wrapResourse, createResourse } = ctx.helpers
  const controller = getController(ctx, parent)

  const api = asyncRouter();
  api.get('/list', controller.getList)

  return api
}
