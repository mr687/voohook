const express = require('express'),
      morgan = require('morgan'),
      http = require('http'),
      SocketIO = require('socket.io'),
      uuid = require('uuid')

const app = express()
const server = http.createServer(app)
const socket = SocketIO(server)
global.app = app
global.uuid = uuid

app.set('name', process.env.APP_NAME)
app.set('url', process.env.APP_URL)
app.set('port', process.env.PORT || process.env.APP_PORT || 5000)
app.set('secret', process.env.APP_SECRET)
app.set('config', require('./config'))
app.set('util', require('./util'))
app.set('middlewares', require('./middlewares'))
app.set('io', socket)
app.set('trust proxy', app.get('env') === 'production')
app.set('views', __dirname+'/views')
app.set('view engine', 'twig')
app.disable('x-powered-by')
app.locals.util = app.get('util')

app.use(morgan('dev'))
app.use(app.get('middlewares').helmet)
app.use(express.static(__dirname+'/../public'))
app.use(app.get('middlewares').parser.urlencoded)
app.use(app.get('middlewares').method)
app.use(require('./routes'))
app.use((req, res, next)=>{
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})
app.use((err, req, res, next) => {
  debug(err.message)
  res.locals.error_code = err.status || err.code || 500
  res.locals.error_message = err.message || 'Internal server error!'
  if (app.get('env') !== 'production'){
    err.message = err.stack
  }
  res.format({
    'text/plain': function () {
      res.status(err.status || err.code || 500).send(err.message)
    },
    'text/html': function () {
      res.render('error')
    },
    'application/json': function () {
      res.status(err.status || err.code || 500).send({ error: true, message: err.message })
    },
    default: () => {
      res.status(406).send('Not Acceptable')
    }
  })
})

module.exports = server