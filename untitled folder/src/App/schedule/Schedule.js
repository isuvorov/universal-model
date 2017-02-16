import schedule from 'node-schedule'
const Schedule = {}
export default function () {
  Schedule.mapper = {}
  Schedule.add = function (title, date, func) {
    if (this.mapper[title] != null) {
      return false
    }
    this.mapper[title] = schedule.scheduleJob(date, func);
    return this.mapper[title]
  }
  Schedule.cancel = function (title) {
    if (this.mapper[title]) {
      try {
        this.mapper[title].cancel()
      } catch (e) {
        console.error(e)
      }
    }
    return null
  }
  Schedule.get = function (title) {
    return this.mapper[title] || null
  }
  return Schedule
}
