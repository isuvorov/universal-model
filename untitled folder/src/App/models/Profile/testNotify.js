export default (ctx) => {
  // const defLocale = 'en'


  const notice = {}
  notice.noticeTypes = {
    'msg1': async function({ from }, locale) {
      const text = `${from.name} просит помочь вас в изучении языка`
      return text
    },
    'msg2': async function({ from }, locale) {
      const text = `${from.name} предложил(а) вам место и время встречи.`
      return text
    },
    'msg3': async function( { request, to }, locale) {
      const text = `К сожалению, ${to.name} не может вам помочь сейчас в изучении языка. Попробуйте повторить запрос попозже.`
      return text
    },
    'msg4': async function({ request, from }, locale) {
      const text = `${from.name} хочет помочь вам в изучении языка.`
      return text
    },
    'msg5': async function({ request, from, to }, locale) {
      const text = `${to.name} подтвердил(а) вашу встречу.`
      return text
    },
    'msg6': async function({ request, from, to }, locale) {
      const text = `К сожалению, ${from.name} не может с вами встретится в указанные время и месте. Попробуйте предлжить помощь попозже.`
      return text
    },
    'msg7': async function({ event }, locale) {
      const text = `Скоро рядом с вами будут практивать ${event.language}`
      return text
    },
    'msg8': async function({ event, profile }, locale) {
      const text = `${profile.name} тоже придет на встречу ${event.startDate.toUTCString()}`
      return text
    },
    'msg9': async function({ from, message }, locale) {
      const text = `${from.name} прислал: ${message}`
      return text
    },
    'msg10': async function({ from, message  }, locale) {
      const text = `${from.name} прислал: ${message}`
      return text
    },
    'msg11': async function({ request, profile }, locale) {
      const text = `К сожалению, ${profile.name} отменил встречу.`
      return text
    },
    'msg12': async function({ request, profile }, locale) {
      const text = `${profile.name} предлагает вам другие место и время встречи`
      return text
    },
    'msg13': async function({ event }, locale) {
      const text = `К сожалению, встреча "${event.title}" была отменена.`
      return text
    },
    'msg14': async function({ event }, locale) {
      const text = `Создатель встречи "${event.title}" изменил место встречи`
      return text
    },
    'msg15': async function({ event }, locale) {
      const text = `Создатель встречи "${event.title}" изменил время встречи`
      return text
    },
    'msg16': async function({ profile }, locale) {
      const text = `Недалеко от тебя есть носитель одного из изучаемых языков. Назначь ему встречу!`
      return text
    },
    'msg17': async function({ profile }, locale) {
      const text = `К "Hi, Jay" присоединился ${profile.name}. Назначь ему встречу и поговори с ним на ${profile.nativeLanguage}!`
      return text
    },
    'msg18': async function({ text }, locale) {
      return text
    },
    'msg19': async function({ event }, locale) {
      const text = `Скоро рядом с тобой пройдет групповая встреча на ${event.language}`
      return text
    },
    'msg20': async function({ event, profile }, locale) {
      const text = `${profile.name} пойдет на групповую встречу "${event.title}". Присоединяйся!`
      return text
    },
  }
  notice.get = function(msg) {
    return this.noticeTypes[msg] || null
  }

  return notice
}
