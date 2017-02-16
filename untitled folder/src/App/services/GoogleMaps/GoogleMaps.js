import fetch from 'node-fetch'
import moment from 'moment-timezone'
export default () => {
  const API_KEY = 'AIzaSyAougEtL_3MnfCKI_M1Drcdrb7aucwYMLk'
  const service = {}
  service.getTimezone = async function(lat, lng) {
    const timestamp = new Date().getTime() / 1000
    const response = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${API_KEY}`)
    const json = await response.json()
    if (json && json.timeZoneId) {
      console.log(json)
      return json.timeZoneId
    }
    return 'Europe/Moscow'
  }
  service.getDateByTimezone = function (date, timezone) {
    return moment(date).tz(timezone)
  }
  return service
}
