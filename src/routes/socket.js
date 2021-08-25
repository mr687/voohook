const io = app.get('io'),
      middleware = app.get('middlewares').socket

global.io = io

io.use(middleware)
io.on('connection', _onConnection)

function _onConnection(socket) {
  const { handshake } = socket
  socket.join(handshake.sid)
}

exports = true