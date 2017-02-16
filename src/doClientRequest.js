import createClientAction from './createClientAction';
export default function doClientRequest(params) {
  return createClientAction(params)(params.arguments);
}
