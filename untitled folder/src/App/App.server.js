import ReactApp from 'lego-starter-kit/ReactApp'
import getApi from './api/v1'
import getApiV2 from './api/v2'
import getApiV3 from './api/v3'
import getDocsV1 from './api/v1/getDocs'
import getDocsV2 from './api/v2/getDocs'
import getDocsV3 from './api/v3/getDocs'
import routes from './routes'
import assets from './assets'; // eslint-disable-line import/no-unresolved

import getModels from './models'
import getModelsV2 from './models/v2'
import getOnlineMap from './api/v1/onlineMap'
import getGoogleMaps from './services/GoogleMaps'
import getAdminCrudWrapper from './services/AdminCrudWrapper'
import getMailNotifications from './services/MailNotifications'
import getPushNotifications from './services/PushNotifications'
import getSchedule from './schedule'
import TelegramBot from 'node-telegram-bot-api'
import fs from 'fs'
import express from 'express'
import validator from 'validator'
import getDocsTemplate from './getDocsTemplate'
import bodyparser from './middleware/bodyparser'
import reqRes from './middleware/reqRes'
import logger from './middleware/logger'
export default class App extends ReactApp {

  init() {
    this.addServices()
    super.init()
    // this.responses = require('./responses')
    this.Schedule = getSchedule(this)
    this.onlineMap = getOnlineMap(this)
    this.changeModelsMethods()
    const { Message, Event } = this.models
    Message.pubNubInit()
    // Event.reportNearEvents()
    this.TelegramBot = new TelegramBot('256145359:AAEvGvAvqX2ZRcTrjITFwjB7SOh83FIPqO8', { polling: true })
  }
  addServices() {
    this.services = {
      GoogleMaps: getGoogleMaps(this),
      MailNotifications: getMailNotifications(this),
      PushNotifications: getPushNotifications(this),
      AdminCrudWrapper: getAdminCrudWrapper(this),
    }
  }
  getModels() {
    const superModels = super.getModels()
    const models = getModels(this)
    const modelsV2 = getModelsV2(this)
    Object.assign(superModels, models)
    superModels.v2 = modelsV2
    return superModels
  }

  changeModelsMethods() {
    // this.models.Profile._find = this.models.Profile.find
    // this.models.Profile.find = function (query) {
    //   return this._find({
    //     deleted: false,
    //   }, query)
    // }
  }

  addHelpers() {
    const ctx = this
    this.helpers.isAuth = function (req) {
      if (req._errJwt) {
        throw ctx.errors.e500(req._errJwt)
      }
      if (!req.user || !req.user._id) {
        throw ctx.errors.e401('!req.user')
      }
      ctx.onlineMap.update(req.user._id)
      ctx.models.Profile.updateLastVisit(req.user._id)
    }
    this.helpers.getBase64FileType = function (data) {
      // console.log({ data })
      if (typeof(data) !== 'string') {
        return null
      }
      if (data.length === 0) {
        return null
      }
      if (data.charAt(0) === '/') {
        return 'jpeg'
      } else if (data.charAt(0) === 'R') {
        return 'gif'
      } else if (data.charAt(0) === 'i') {
        return 'png'
      }

      return null;
    }
    this.helpers.isBase64 = function (str) {
      if (ctx.helpers.getBase64FileType(str) === null) {
        return false
      }
      return validator.isBase64(str)
    }
    this.helpers.saveFile = async function(title, file) {
      const dirname = `${__dirname}/public`
      if (!file) {
        return null
      }
      const fileName = `/storage/${title}.${ctx.helpers.getBase64FileType(file)}`
      const path = dirname + fileName
      const buf = new Buffer(file, 'base64');
      fs.writeFile(path, buf);
      return fileName
    }
    this.helpers._checkNotFound = function (name = 'Object') {
      return function checkNotFound(data) {
        if (!data) throw ctx.errors.e404(`${name} not found`)
        return Promise.resolve(data)
      }
    }
    this.helpers.getFileExtensionFromPath = function (path) {
      const res = path.match(/\.([0-9a-z]+)(?:[\?#]|$)/i)
      if (res && res[1]) {
        return res[1]
      }
      return null
    }
    this.helpers.getFilePathWithoutExtension = function (path) {
      try {
        return path.replace(/\.[^/.]+$/, '')
      } catch (err) {
        return path
      }
    }
  }
  useRoutes() {
    this.addHelpers()
    this.app.all('/api', (req, res) => {
      return res.json({ message: 'Current API version is here: /api/v2', url: '/api/v2' })
    })
    this.app.use('/api/v1', this.getDocsRouter(getDocsV1, {
      v: 1,
      path: `/api/v1`,
      port: this.config.port,
      name: "HiJay",
    }))
    this.app.use('/api/v1', getApi(this))
    this.app.use('/api/v2', this.getDocsRouter(getDocsV2, {
      v: 2,
      path: '/api/v2',
      port: this.config.port,
      name: "HiJay",
    }))
    this.app.use('/api/v2', getApiV2(this))
    this.app.use('/api/v3', this.getDocsRouter(getDocsV3, {
      v: 3,
      path: '/api/v3',
      port: this.config.port,
      name: "HiJay",
    }))
    this.app.use('/api/v3', getApiV3(this))
  }

  getStatics() {
    return {
      ...super.getStatics(),
      ...{
        '/': __dirname + '/../build/public',
        '/static': __dirname + '/../src/public',
      },
    }
  }

  beforeUseMiddlewares() {
    this.app.use(reqRes(this))
    this.app.use(logger(this))
    this.app.use(bodyparser(this))
    this.app.use(this.helpers.parseUser)
  }

  getAssets() {
    return assets.main
  }

  getDocsRouter(getDocs, params) {
    const api = this.asyncRouter()
    const docsParams = Object.assign({}, params, {
      docs: `${params.path || '/api'}/docs`,
      docsJson: `${params.path || '/api'}/docs/json`,
    })
    api.all('/', (req, res) => res.json(docsParams))
    api.all('/docs', (req, res) => res.send(getDocsTemplate(this, docsParams)))
    api.all('/docs/json', (req, res) => res.json(getDocs(this, docsParams)))
    return api
  }



  static Html = require('./Html').default
  Provider = require('./stores/AppStore').default

  getUniversalRoutes() {
    return routes
  }


}
