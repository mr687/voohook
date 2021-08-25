const router = require('express').Router()

require('./socket')

router.route('/')
  .all(
    app.get('middlewares').cors,
    ...app.get('middlewares').session
  )
  .get(_homeRoute)

router.use(require('./webhook'))

function _homeRoute(req, res, next){
  res.redirect(301, app.get('util').urlTo(`/@/${req.session.id}`))
}

module.exports = router