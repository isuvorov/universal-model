import createClientAction from './createClientAction';

export default function createClientActions({ actions, ...config }) {
  if (!Array.isArray(actions)) throw '!actions not Array';

  const actionMethods = {};
  actions.forEach((action) => {
    actionMethods[action] = createClientAction({ ...config, action });
  });
  return actionMethods;
}
