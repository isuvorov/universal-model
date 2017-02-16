import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
import getController from './auth.controller'
export default (ctx) => {
  const api = asyncRouter();
  const controller = getController(ctx)
  api.all('/authenticate', controller.authenticate)
  return api
}
