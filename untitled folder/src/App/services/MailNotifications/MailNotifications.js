import nodemailer from 'nodemailer'
import inlineCss from 'nodemailer-juice'
import getTemplates from './Templates'
export default (ctx) => {
  const transporter = (ctx.config.mail && ctx.config.mail.transport)
  && Promise.promisifyAll(nodemailer.createTransport(ctx.config.mail.transport))
  ctx.htmlStaticPath = 'https://hijay.mgbeta.ru/static/'
  transporter.use('compile', inlineCss());
  const service = {}
  service.sendEmail = async function(sendParams, emailParams) {
    const options = Object.assign({
      subject: 'HiJay',
    }, ctx.config.mail.options, sendParams)
    const html = this.getHtml(emailParams)
    if (!html) return null
    options.html = html
    // console.log(options)
    return transporter.sendMailAsync(options)
  }
  service.templates = getTemplates(ctx)
  service.getHtml = function (emailParams) {
    return this.templates.getHtml(ctx, emailParams)
  }
  return service
}
