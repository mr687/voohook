const cors = require('cors')

const options = {
  "origin": "https://voohook.ngoder.com",
  "methods": "GET,POST",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}

module.exports = cors(options)