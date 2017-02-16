export default (ctx) => {
  const { Profile } = ctx.models
  const online = {}
  online.map = []
  online.dbCount = 20
  online.timeout = 15 * 60 * 1000 // 15 минут
  online.update = function update(userId) {
    const status = {
      date: new Date(),
    }
    let dbCount = 0
    if (this.map[userId] && this.map[userId].dbCount) {
      dbCount = this.map[userId].dbCount
    }
    status.dbCount = dbCount++
    this.map[userId] = status
  }
  online.isOnline = function isOnline(userId) {
    if (!this.map[userId] || !this.map[userId].date) {
      return false
    }
    return (new Date() - this.map[userId].date) < this.timeout
  }
  online.getLastVisited = function getLastVisited(userId) {
    if (!this.map[userId]) {
      return null
    }
    return this.map[userId].date
  }
  return online
}
