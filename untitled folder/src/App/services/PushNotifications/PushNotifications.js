import FCM from 'fcm-push'
export default (ctx) => {
  const service = {
    fcm: new FCM(ctx.config.fcm.serverKey),
    limits: {
      msg7: 1000 * 60 * 10, // 10 минут
      msg17: 1000 * 60 * 60 * 2, // 120 минут
    },
    map: {},
    getId(profileId, msgType) {
      return `${profileId}_${msgType}`
    },
    check(profileId, msgType) {
      if (!this.limits[msgType]) return true
      const id = this.getId(profileId, msgType)
      if (this.map[id]) {
        const currentDate = new Date()
        const lastDate = new Date(this.map[id])
        if (currentDate - lastDate < this.limits[msgType]) return false
      }
      return true
    },
    update(profileId, msgType) {
      if (!this.limits[msgType]) return null
      const id = this.getId(profileId, msgType)
      this.map[id] = new Date()
      return true
    },
    pushSend(devices = [], data) {
      const promises = devices.map(device => {
        const message = {
          to: device.token,
          notification: {
            title: data.title || 'Title of your push notification',
            body: data.title || 'Body of your push notification',
            badge: data.notificationsCount || 0,
          },
          priority: 'high',
          content_available: true,
          data,
        }
        return service.fcm.send(message)
        .then(response => {
          console.log('push res', response);
        })
        .catch(err => {
          console.log('push err', err);
        })
      })
      return Promise.all(promises)
    },
  }
  return service
}
