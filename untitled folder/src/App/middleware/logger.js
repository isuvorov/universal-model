import uuid from 'uuid'
import leftPad from 'left-pad'

function levelFn(data) {
  if (data.err || data.status >= 500 || data.duration > 10000) { // server internal error or error
    return "error";
  } else if (data.status >= 400 || data.duration > 3000) { // client error
    return "warn";
  }
  return "info";
}

function logStart(data){
  return `${leftPad(data.method, 4)} ${data.url} started reqId=${data.reqId}`// + '\x1b[33mYAUEBAN\x1b[0m AZAZA'
}
function logFinish(data){
  const time = (data.duration || 0).toFixed(3)
  const method = leftPad(data.method, 4)
  const length = data.length || 0
  return `${leftPad(data.method, 4)} ${data.url} ${leftPad(data.status, 3)} ${leftPad(time, 7)}ms ${leftPad(length, 5)}b reqId=${data.reqId}`
}

export default (params) => ([
  // require('bunyan-request-logger')().requestLogger(),
  (req, res, next) => {
    if (__PROD__) {
      req.reqId = uuid.v4()
    } else {
      global.reqId = 1 + (global.reqId || 0)
      req.reqId = global.reqId
    }
    // params.log.info('test')
    //
    if (params.log) {
      req.log = params.log.child({
        reqId: req.reqId,
      });
    }
    next()
  },
  // (req, res, next) => {
  //
  //   res.jsonOriginal = res.json
  //   res.json = (...args) => {
  //     req.log.trace('INPUT', req.body)
  //     req.log.trace('OUTPUT', args[0])
  //     return res.jsonOriginal(...args)
  //   }
  //
  //   next()
  // },
  // require('morgan')('dev'),
  (req, res, next) => {

    const parseUA = false

    const data = {}
    const log = req.log.child({
      component: 'req',
    });

    data.reqId = req.reqId
    data.method = req.method
    if (req.ws) data.method = 'WS'
    data.host = req.headers.host
    data.url = (req.baseUrl || '') + (req.url || '-')
    data.referer = req.header('referer') || req.header('referrer')
    data.ua = parseUA ? useragent.parse(req.header('user-agent')) : req.header('user-agent')
    data.ip = req.ip || req.connection.remoteAddress ||
        (req.socket && req.socket.remoteAddress) ||
        (req.socket.socket && req.socket.socket.remoteAddress) ||
        '127.0.0.1'


    if (__DEV__) {
      log.debug(data, logStart(data));
      if (req.body) {
        log.trace(JSON.stringify(req.body));
      }
    }
    // if (__DEV__) {
    //   console.log(data, logStart(data));
    //   if (req.body) {
    //     console.log(JSON.stringify(req.body));
    //   }
    // }

    const hrtime = process.hrtime();
    function logging() {
      data.status = res.statusCode
      data.length = res.getHeader('Content-Length')

      const diff = process.hrtime(hrtime);
      data.duration = diff[0] * 1e3 + diff[1] * 1e-6

      log[levelFn(data)](data, logFinish(data));
    }
    res.on('finish', logging);
    res.on('close', logging);
    next();
  }
])
