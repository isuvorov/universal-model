export default function () {
  const models = {
    Request: require('./Request').default(...arguments),
  }
  return models
}
