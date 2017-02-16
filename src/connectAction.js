import createClientAction from './createClientAction';

// / CONNNECT!!!!!!!!!! wrap fetch
export default function connectAction(action, params) {
  const clientAction = createClientAction(params);
  return async function (...args) {
    const res = await clientAction(...args);
    if (action && typeof 'action' === 'function') return action(res, args);
    return res;
  };
}
