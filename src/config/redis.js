const Redis = require('redis'),
      ConnectRedis = require('connect-redis')

const config = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || '6379',
  password: process.env.REDIS_PASSWORD || null,
  prefix: 'vhk_',
}

config.client = Redis.createClient({
  host: config.host,
  port: config.port,
  password: config.password,
  db: config.db,
  prefix: config.prefix
})
config.redisStore = (session) => {
  const RedisStore = ConnectRedis(session)
  return new RedisStore({client: config.client})
}

module.exports = config