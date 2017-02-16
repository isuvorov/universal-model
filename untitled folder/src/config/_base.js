/* eslint key-spacing:0 spaced-comment:0 */
/* eslint-disable */
import _debug from 'debug'
import path from 'path'
import {argv} from 'yargs'
const pkg = require('../../package.json')

const config = {
  name: 'HiJay',
  env: process.env.NODE_ENV || process.env.ENV || 'development',
  port: process.env.PORT || 8080,
  external_port: process.env.EXTERNAL_PORT || 80,
  clientSecret: '#piupiu!!!QWErty123HiJAY_2016#',
  // host: process.env.HOST || 'hijay.mgbeta.ru',
  // protocol: process.env.PROTOCOL || 'https',
  host: process.env.HOST || 'localhost',
  protocol: process.env.PROTOCOL || 'http',
  push_notifications: process.env.PUSH_NOTIFICATIONS || false,
  fcm: {
    senderId: '902492258604',
    serverKey: 'AIzaSyD14uP3dZmd3IooGRtc_DenLE2vvGbvMvg',
  },
  pubnub: {
    publishKey: 'pub-c-2e019492-9246-497c-89bd-369e28e5615a',
    subscribeKey: 'sub-c-f8937b28-92d7-11e6-974e-0619f8945a4f',
    secretKey: 'sec-c-MTdkZDkxYTQtMTE1OC00YzgyLWFmYzItMDllYzE1ZmZhMGM1',
    channel: 'users.*',
  },
  mail: {
    bugReport: 'shitric2@gmail.com',
    report: 'support@hi-jay.eu',
    transport: {
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: 'support@hi-jay.eu',
        pass: 'Hi1Support2',
      },
    },
    options: {
      from: '"HiJay" <support@hi-jay.eu>',
    },
  },
  db: {
    uri: process.env.DB || 'mongodb://s3.mgbeta.ru:10098/tests',
    // uri: 'mongodb://s3.mgbeta.ru:10098/hijay-dev',
    // uri: 'mongodb://s3.mgbeta.ru:10098/hijay-tests',
    options: {},
  },
  jwt: {
    secret: 'qweqweqwe12312312',
    devToken: '',
  },
  swagger: {
    devToken: '',
    port: process.env.SWAGGER_PORT || 80,
  },
  logic: {
    profiles: {
      // Уведомляет других пользователей о регистрации нового пользователя в этом радиусе
      onRegister: 25,
      jaysDistance: 25,
    },
    events: {
      // Сколько дополнительно показывать групповые встречи после их начала
      startDateTimeout: 10800000,
      // Оповещать о групповых встречах на расстоянии (км)
      distance: 25,
      // Оповещать о скором начале встречи на расстоянии
      beforeStart: 10,
    },
    requests: {
      // Сколько дополнитель показывать встречи после их начала
      startDateTimeout: 10800000,
      // Оповещать о встречах на расстоянии (км)
      distance: 25,
    },
  },
}
if (!process.env.EXTERNAL_PORT && config.protocol === 'https') {
  config.external_port = 443
}
if (!process.env.SWAGGER_PORT && config.protocol === 'https') {
  config.swagger.port = 443
}
config.url = `${config.protocol}://${config.host}:${config.external_port}`
config.globals = {
  'process.env': {
    'NODE_ENV': JSON.stringify(config.env)
  },
  'NODE_ENV': config.env,
  '__DEV__': config.env === 'development',
  '__PROD__': config.env === 'production',
  '__TEST__': config.env === 'test',
  '__DEBUG__': config.env === 'development' && !process.env.NODEBUG,
  '__BASENAME__': JSON.stringify(process.env.BASENAME || '')
}

export default config
