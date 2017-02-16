import fetch from 'isomorphic-fetch'
import _ from 'lodash'
export default class AdminApi {
  constructor(props) {
    this.state = {
      path: props.path,
      models: props.models || ['Profile', 'Request', 'Event'],
      token: localStorage.getItem('token'),
    }
    this.state.models.forEach(model => {
      this[`get${model}s`] = (...params) => {
        return this.get(`/${model.toLowerCase()}s`, ...params)
      }
      this[`get${model}`] = (id, ...params) => {
        return this.get(`/${model.toLowerCase()}s/${id}`, ...params)
      }
      this[`update${model}`] = (id, ...params) => {
        return this.put(`/${model.toLowerCase()}s/${id}`, ...params)
      }
      this[`remove${model}`] = (id, ...params) => {
        return this.delete(`/${model.toLowerCase()}s/${id}`, ...params)
      }
      this[`create${model}`] = (...params) => {
        return this.post(`/${model.toLowerCase()}`, ...params)
      }
    })
  }
  async request(link, method = 'get', params = {}) {
    console.log(`${this.state.path}${link}`)
    const response = await fetch(`${this.state.path}${link}`, { method, ...params })
    const json = await response.json()
    return json
  }
  get(link, body = {}) {
    console.log({ state: this.state });
    const keys = Object.keys(body)
    if (keys.length > 0) {
      link += '?'
    }
    let firstParam = true
    _.mapKeys(body, (value, key) => {
      if (!firstParam) {
        link += '&'
        firstParam = false
      }
      link += `${key}=${value}`
    })
    return this.request(link, 'get', {
      headers: {
        'x-access-token': this.state.token,
      },
    })
  }
  put(link, body = {}) {
    return this.request(link, 'put', {
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': this.state.token,
      },
    })
  }
  post(link, body = {}) {
    return this.request(link, 'post', {
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': this.state.token,
      },
    })
  }
  delete(link) {
    return this.request(link, 'delete', {
      headers: {
        'x-access-token': this.state.token,
      },
    })
  }
}
