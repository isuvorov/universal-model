const defaultRoute = '/universal';

// @TODO: Придумать имя
export default function createClientAction(args1) {
  const { api, route = defaultRoute, params, model, action, transform, format, onError } = args1;
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
    if (transform) return transform(pack.data);
    if (format) {
      console.log({format});
      if (Array.isArray(format)) {
        if (!Array.isArray(pack.data)) {
          throw 'format(pack.data) exprect Array type';
        }
        return pack.data.map(a => new format[0](a));
      }
      return new format(a);  // eslint-disable-line
    }
    return pack.data;
  };
}
