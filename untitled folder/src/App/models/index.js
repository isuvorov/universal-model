const extend = require('mongoose-schema-extend')
export default function () {
  const models = {
    Profile: require('./Profile').default(...arguments),
    Request: require('./Request').default(...arguments),
    Event: require('./Event').default(...arguments),
    Abuse: require('./Abuse').default(...arguments),
    AbuseProfile: require('./Abuse/AbuseProfile').default(...arguments),
    AbuseEvent: require('./Abuse/AbuseEvent').default(...arguments),
    Report: require('./Report/Report').default(...arguments),
    Message: require('./Message').default(...arguments),
    Q: require('./Q').default(...arguments),
  }
  return models
}
