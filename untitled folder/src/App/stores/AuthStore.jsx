import { observable } from 'mobx';
import cookie from 'react-cookie';
import _ from 'lodash';
import { autobind } from 'core-decorators';

function getHash(str) {
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function genPass(email) {
  return getHash(email)
}


export default class AuthStore {
  constructor(app) {
    this.app = app
  }

  @observable token = null
  @observable user = null
  @observable isAuth = null


  promise = null

  @autobind
  isAuthAsync() {
    return this.promise
    .then(() => !!this.isAuth)
    .catch(() => !!this.isAuth)
  }

  async checkIsAuth(onFail) {
    this.init()
    const isAuth = await this.isAuthAsync()
    const token = localStorage.getItem('token')
    console.log({ isAuth, token })
    if (!isAuth && typeof onFail === 'function') {
      return onFail()
    }
    if (!isAuth) {
      return onFail
    }
    return true
  }

  @autobind
  init() {
    console.log('INIT')
    const token = localStorage.getItem('token')
    console.log({ token })
    if (token) {
      this.promise = this.login({token}).catch(err => {
        console.log('AuthStore.init', err);
        return {}
      })
    } else {
      this.promise = Promise.resolve()
    }
    return {}
  }

  @autobind
  async signup(data) {
    this.promise = this.app.api.authSignup(data)
    const res = await this.promise
    await this.save(res)
  }

  @autobind
  async login(data) {
    this.promise = this.app.api.authLogin(data)
    const res = await this.promise
    await this.save(res)
  }

  @autobind
  async logout() {
    cookie.remove('authToken');
    this.app.api.setAuthToken(null)
    this.user = null
    this.token = null
    this.isAuth = null
    this.app.update()
  }

  @autobind
  async save(data) {
    cookie.save('authToken', data.token);
    localStorage.setItem('token', data.token)
    this.token = data.token
    this.isAuth = true
    this.app.update()
  }

  @autobind
  async social(type) {
    // let data
    // if (type === 'vk') {
    //   data = await this.loginAuthVk()
    // } else if (type === 'facebook') {
    //   data = await this.loginAuthFacebook()
    // } else if (type === 'twitter') {
    //   data = await this.loginAuthTwitter()
    // } else {
    //   throw new Error('!social auth')
    // }
    // console.log('socialData', data);

    let res
    try {
      res = await this.signup(data)
    } catch (err) {
      console.log({err});
      res = await this.login(data)
    }
    return res

  }

  // loginAuthVk() {
  //   // console.log('this.app.config', this.app.config, this);
  //   const appId = this.app.config.auth.vk.appId
  //   return new Promise((resolve, reject) => {
  //     VK.Auth.login((vk) => {
  //       // console.log('vk', vk);
  //       VK.Api.call('users.get', {
  //         user_ids: vk.session.user.id,
  //         fields: 'counters, city, photo_max, photo_max_orig, email',
  //       }, (res) => {
  //         if (!res.response) return reject(res)
  //         // console.log('res1', res);
  //         const user = res.response[0]
  //         const pack = {}
  //         pack.id = user.uid
  //         pack.session = _.pick(vk.session, ['expire', 'mid', 'sid', 'sig', 'secret'])
  //         pack.user = {
  //           name: `${user.first_name} ${user.last_name}`,
  //           avatar: user.photo_max,
  //           cover: user.photo_max_orig,
  //         }
  //         VK.Api.call('database.getCitiesById', {
  //           city_ids: user.city,
  //         }, (res) => {
  //           if (!res.response) return reject(res)
  //           pack.user.location = res.response[0].name
  //
  //           const email = pack.id + '@vk.com'
  //           const password = genPass(email)
  //
  //           resolve({
  //             ...pack.user,
  //             email,
  //             password,
  //           })
  //         })
  //       });
  //     }, 4194304)
  //   })
  // }

  // loginAuthFacebook() {
  //   return new Promise((resolve, reject) => {
  //     const data = {}
  //     FB.login(function(response){
  //       console.log('response1', response);
  //       FB.api('/me', { fields: 'id, name, email, picture ' }, function(response) {
  //
  //         console.log('response2', response);
  //
  //         data.id = response.id;
  //         data.email = response.email;
  //         if (!data.email) {
  //           data.email = data.id + '@facebook.com'
  //         }
  //         data.name = response.name;
  //         try {
  //           data.avatar = response.picture.data.url;
  //           data.cover = response.picture.data.url;
  //         } catch(err) {
  //           console.log(err);
  //         }
  //         data.password = genPass(data.email)
  //
  //         resolve(data)
  //       });
  //       // FB.api('/me/picture?type=large', function(response) {
  //       //   data.avatar = response.data.url
  //       //   // console.log('me3',response.data.url)
  //       // });
  //     }, {scope: 'public_profile,user_about_me,user_birthday,user_location,user_photos,email'})
  //
  //   })
  // }
  //
  //
  // loginAuthTwitter() {
  //   return new Promise((resolve, reject) => {
  //
  //     alert('Авторизация Твиттера не поддерживается')
  //     // fetch('https://api.twitter.com/oauth/request_token', {
  //     //   method: 'POST'
  //     // }).then(res => {
  //     //   console.log(res);
  //     // })
  //
  //   })
  // }



}
