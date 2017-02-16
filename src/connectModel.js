import getConfig from './getConfig';
import getActions from './getActions';
import createClientAction from './createClientAction';

export default function connectModel(model, params) {
  const config = getConfig(model, params);
  const actions = getActions(config.actions);

  actions.forEach((action) => {
    model[action.name] = createClientAction({ ...config, ...action, action: action.name });
  });
}
