import ApiClientBase from 'lego-starter-kit/CoreApp/api/api.client'

export default class ApiClient extends ApiClientBase {
  async authLogin(data) {
    let url = '/admin/login?'
    if (data) {
      const keys = Object.keys(data)
      keys.map(key => {
        url+=`${key}=`
        url+=data[key]
        url+='&'
      })
    }
    return this.fetch(url, {
      method: 'GET',
    })
  }
}
