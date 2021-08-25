const ExpressSession = require('express-session'),
      redis = require('./redis')

const config = {
  name: 'vhk',
  store: redis.redisStore(ExpressSession),
  saveUninitialized: true,
  secret: app.get('secret'),
  resave: false,
  genid: (req) => {
    return uuid.v4()
  },
  cookie: {
    httpOnly: true,
    secure: app.get('env') === 'production',
    maxAge: 1000*60*60*24, // 1 day,
    sameSite: true,
  }
}

module.exports = config