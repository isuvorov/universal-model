import nodemailer from 'nodemailer'
export default function nodemail(ctx) {
  const mailer = {}

  mailer.transporter = (ctx.config.mail && ctx.config.mail.transport) && Promise.promisifyAll(nodemailer.createTransport(ctx.config.mail.transport))

  mailer.sendMail = async function(params) {
    const options = Object.assign(ctx.config.mail.options, params)
    return mailer.transporter.sendMailAsync(options);
  }

  return mailer
}
