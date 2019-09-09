const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const WEBRTC_MESSAGE = 'signal'

app.use(express.static('./static'))

const ws = io.of('/ws').on('connection', socket => {
  console.log('connected:', socket.id)
  socket.on('disconnect', reason => console.log('disconnected:', socket.id, reason))

  socket.on(WEBRTC_MESSAGE, data => {
    console.log('message:', data)
    // broadcast offer message to all clients
    if (data && data.desc && data.desc.type === 'offer') {
      return socket.broadcast.emit(WEBRTC_MESSAGE, data)
    }
    // ignore other messages if they don't have id
    if (!data || !data.id) {
      return
    }
    ws.to(data.id).emit(WEBRTC_MESSAGE, data)
  })
})

server.listen(8080, () => {
  console.log('listen: 8080')
})
