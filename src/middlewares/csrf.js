const csrf = require('csurf')

module.exports = [
  csrf(),
  (req, res, next) => {
    if (req.method.toUpperCase() === 'GET'){
      res.locals._csrf = req.csrfToken()
    }
    next()
  }
]