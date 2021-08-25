const helmet = require('helmet')

module.exports = helmet({
  referrerPolicy: { policy: "no-referrer" },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "cdn.jsdelivr.net", "*.fontawesome.com", "fonts.cdnfonts.com"],
    },
  }
})