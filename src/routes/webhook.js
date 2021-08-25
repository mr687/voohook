const router = require('express').Router(),
      httpErrors = require('http-errors'),
      middlewares = app.get('middlewares'),
      util = app.get('util')

router.route('/@/:sid/:hid?')
  .all(
    app.get('middlewares').cors,
    ...app.get('middlewares').session,
    ...app.get('middlewares').csrf,
    (req, res, next) => {
      const { sid, hid } = req.params
      if (sid !== req.session.id) return res.redirect('/')
      res.locals.sid = sid
      const { download, mimetype } = req.query
      if (download && mimetype) {
        return _downloadAction(res, download, mimetype, sid)
      }
      if (hid && req.session.hooks) {
        res.locals.hook = req.session.hooks.find(x => x.id === hid)
        res.locals.hid = hid
      }
      res.locals.webhookUrl = app.get('util').urlTo(`/${sid}`)
      next()
    },
  )
  .get((req, res) => {
    if (!res.locals.hook && res.locals.hooks && res.locals.hooks.length){
      return res.redirect(app.get('util').urlTo(`/@/${res.locals.sid}/${res.locals.hooks[res.locals.hooks.length-1].id}`))
    }
    res.render('pages/webhook/index')
  })
  .delete((req, res) => {
    const index = req.session.hooks.findIndex(x => x.id === res.locals.hid)
    if (index !== -1){
      req.session.hooks.splice(index, 1)
    }
    res.redirect('/')
  })

router.route('/:sid')
  .post(
    middlewares.parser.json,
    middlewares.parser.urlencoded,
    middlewares.formdata.any(),
    _hookRoute
  )
  .all(
    _acceptedMethod,
    middlewares.parser.jsonRaw,
    middlewares.parser.urlencodedRaw,
    middlewares.parser.raw,
    _hookRoute
  )

function _hookRoute(req, res, next){
  const { sid } = req.params
  if (!app.get('util').validateUuidV4(sid)){
    return next(httpErrors(400), 'Invalid ID!')
  }
  util
    .getSession(sid)
    .then((session) => {
      _emitNewRequest(req, session)
      res.status(200).end()
    })
    .catch(err => next(err))
}

function _downloadAction(res, download, mimetype, sid){
  const buffer = app.get('util').base64.decode(download)
  return res.status(200)
  .set({
    'Content-Type': mimetype || 'text/plain',
    'Content-Disposition': `attachment; filename="${sid}"`
  })
  .end(buffer)
}

function _acceptedMethod(req, res, next) {
  if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(req.method.toUpperCase())){
    return next(httpErrors(405, `The ${req.method} method is not supported for this route. Supported methods: GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS.`))
  }
  next()
}

function _emitNewRequest(req, session) {
  const { sid } = req.params
  const id = uuid.v4()
  const date = new Date()
  const result = {
    id:id,
    sid,
    short_id: id.substr(0,5),
    host: app.get('util').clientIp(req),
    delete: {
      action: app.get('util').urlTo(`/@/${sid}/${id}`),
      method: 'DELETE'
    },
    color: _getColor(req.method.toUpperCase()),
    url: `${app.get('url')}${req.originalUrl}`,
    method: req.method.toUpperCase(),
    date: date.toISOString(),
    date_string: date.toLocaleString(),
    href: app.get('util').urlTo(`/@/${sid}/${id}`),
    headers: req.headers,
    query: Object.keys(req.query).length ? req.query: null,
    body: Object.keys(req.body).length ? req.body: null,
    files: req.files || null,
    raw: req.rawBody || null,
  }
  if (Buffer.isBuffer(result.body)){
    result.body = null
  }
  _saveRequest(result, session, sid)
  io.to(sid).emit('req-update', {
    id: result.id,
    sid,
    short_id: id.substr(0,5),
    color: result.color,
    host: result.host,
    delete: result.delete,
    url: result.url,
    method: result.method,
    date: result.date,
    date_string: result.date_string,
    href: result.href,
  })
}

function _getColor(method) {
  method = method.toLowerCase().trim()
  if (method === 'get') return 'info'
  if (method === 'post') return 'success'
  if (method === 'delete') return 'danger'
  if (method === 'put') return 'warning'
  if (method === 'patch') return 'warning'
  if (method === 'options') return 'secondary'
  if (method === 'head') return 'light'
  return 'dark'
}

function _saveRequest (data, session, sid){
  if (session.hooks && Array.isArray(session.hooks)){
    session.hooks.push(data)
  }else{
    session.hooks = [data]
  }
  sessionStore.set(sid, session, (err, session) => {})
}

module.exports = router