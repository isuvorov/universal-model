import _ from 'lodash';
export default function getActions(actions = []) {
  if (Array.isArray(actions)) {
    return actions.map((action) => {
      if (typeof action === 'string') {
        return {
          name: action,
        };
      }
      return action;
    });
  }
  return _.map((action, name) => {
    if (typeof action === 'string') return { name: action };
    if (action === true) return { name };
    return action;
  });
}
