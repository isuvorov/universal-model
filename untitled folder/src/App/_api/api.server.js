import asyncRouter from 'lego-starter-kit/utils/AsyncRouter'


export default function getApi(ctx) {
  const api = ctx.asyncRouter();

  api.all('*', () => {
    return 'Mobx API working'
  })
  return api;
}
