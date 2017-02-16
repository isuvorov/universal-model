import getRuTempletes from './ru'
import getEnTempletes from './en'

export default () => {
  const service = {}
  service.templates = {
    en: getEnTempletes(),
    ru: getRuTempletes(),
  }

  service.getHtml = function (ctx, emailParams) {
    const { type } = emailParams
    let { language } = emailParams
    if (!type) return null
    if (!language || !service.templates[language]) {
      language = 'en'
    }
    if (this.templates[language]) {
      return this.templates[language].getHtml(ctx, type, emailParams)
    }
    return null
  }
  return service
}
