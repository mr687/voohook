const sAgo = require('s-ago'),
      httpErrors = require('http-errors')

module.exports.validateUuidV4 = (str) => {
  try {
    return uuid.validate(str) && uuid.version(str) === 4
  } catch (error) {
    return false
  }
}
module.exports.timeAgo = (date) => {
  if (typeof date === 'string'){
    date = new Date(date)
  }
  return sAgo(date)
}
module.exports.clientIp = (req) => {
  return (req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.ips.join(',') || 'unknown')
    .replace(/::ffff:/g, '')
    .trim()
}
module.exports.urlTo = (str) => {
  return `${app.get('url')}${str}`
}
module.exports.getSession = (sid) => {
  return new Promise((resolve, reject) => {
    sessionStore.get(sid, (err, session) => {
      if (err) return reject(err)
      if (!session) return reject(httpErrors(400, 'Invalid ID!'))
      return resolve(session)
    })
  })
}
module.exports.fileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
module.exports.base64 = {
  encode: (data) => {
    return Buffer.from(data).toString('base64')
  },
  decode: (data) => {
    return Buffer.from(data, 'base64')
  }
}
module.exports.rawContent = (data) => {
  
}