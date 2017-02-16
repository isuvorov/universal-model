import uuid from 'uuid'

export default (ctx) => ([
  (req, res, next) => {
    if (ctx.__PROD__) {
      req.reqId = uuid.v4()
    } else {
      global.reqId = 1 + (global.reqId || 0)
      req.reqId = global.reqId
    }

    next()
  },
])
