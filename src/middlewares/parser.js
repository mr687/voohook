const express = require('express')

function saveRawBody (req, res, buf, encoding){
  if (buf && buf.length){
    req.rawBody = buf.toString(encoding || 'utf8')
  }
}

module.exports = {
  json: express.json(),
  jsonRaw: express.json({verify:saveRawBody}),
  urlencoded: express.urlencoded({extended: false}),
  urlencodedRaw: express.urlencoded({verify:saveRawBody, extended: false}),
  raw: express.raw({verify: saveRawBody, type: ['multipart/*', 'application/octet-stream']})
}