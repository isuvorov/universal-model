import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'

export default (ctx) => ([
  bodyParser.json({limit: '50mb'}),
  bodyParser.urlencoded({limit: '50mb', extended: true }),
  cookieParser(),
  cors(),
])
