const defaultRoute = '/universal'


// @TODO: Придумать имя
export default function createClientAction({ api, route = defaultRoute, params, model, action, deserialize, onError }) {
  console.log('createClientAction', {route});

  return async function (...args) {
    const pack = await api.fetch(route, {
      method: 'POST',
      body: {
        model,
        action,
        ...params,
        arguments: args,
      },
    });
    if (pack.err) {
      if (onError) {
        onError(pack.err);
      } else {
        throw pack.err;
      }
    }
    if (deserialize) return deserialize(pack.data);
    return pack.data;
  };
}
