import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'
import getReportController from './report.controller'
export default (ctx, parent) => {
  let api = asyncRouter();
  const controller = getReportController(ctx)
  const { wrapResourse, createResourse } = ctx.helpers
  const { Report } = ctx.models

  api.post('/', controller.report)
  // Заглушки
  api.delete('/:id', () => {})

  api = wrapResourse(createResourse(Report), { api })

  return api
}
