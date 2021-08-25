const ExpressSession = require('express-session')

const config = require('../config/session')

module.exports = [
  ExpressSession(config),
  (req, res, next) => {
    Object.assign(res.locals, req.session)
    next()
  }
]