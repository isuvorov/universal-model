const defaultRoute = '/universal';

// @TODO: Придумать имя
export default function createClientAction(args1) {
  const { api, route = defaultRoute, params, model, action, transform, format, onError } = args1;
  return async (...args) => {
    // console.log('action!@#!@#');
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
    const data = pack.data;
    // console.log('aaa aaa1111111');
    if (transform) return transform(data);
    // console.log('aaa 222222');
    if (format) {
      // console.log('aaa 33333', format, data);
      if (Array.isArray(format)) {
        if (!Array.isArray(data)) {
          throw 'format(data) exprect Array type';
        }
        return data.map(a => new format[0](a));
      }
      return new format(data);  // eslint-disable-line
    }
    return data;
  };
}
