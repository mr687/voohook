const cookie = require('cookie'),
      cookieParser = require('cookie-parser'),
      sessionStore = app.get('config').session.store,
      httpErrors = require('http-errors')

global.sessionStore = sessionStore

module.exports = (socket, next) => {
  try {
    const data = socket.handshake || socket.request
    if (!data.headers.cookie){
      return next(httpErrors(403, 'Missing cookie headers!'))
    }
    const cookies = cookie.parse(data.headers.cookie)
    if (!cookies.vhk){
      return next(httpErrors(403, 'Invalid cookie!'))
    }
    const sid = cookieParser.signedCookie(cookies.vhk, app.get('secret'))
    if (!sid){
      return next(httpErrors(403, 'Invalid cookie!'))
    }
    data.sid = sid
    sessionStore.get(sid, (err, session) => {
      if (err) return next(err)
      if (!session) {
        return next(httpErrors(403, 'Invalid cookie!'))
      }
      data.session = session
      next()
    })
  } catch (err) {
    return next(httpErrors(500, 'Internal server error!'))
  }
}