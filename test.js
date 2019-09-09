const io = require('socket.io-client')
const { RTCPeerConnection } = require('wrtc')
const iceServers = [
  {
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
      'stun:stun3.l.google.com:19302',
      'stun:stun4.l.google.com:19302',
      'stun:stun.services.mozilla.com',
    ],
  },
  {
    urls: 'turn:195.201.137.198:3008',
    credential: 'webrtc',
    username: 'webrtc',
  },
]
const WEBRTC_MESSAGE = 'signal'
const channel = io.connect('http://localhost:8080/ws')
channel.on('connect', () => console.log('connected'))
channel.on('disconnect', () => console.log('disconnected'))
channel.on('error', e => console.log('error', e))
channel.on(WEBRTC_MESSAGE, data => onmessage(data))
const send = data => {
  console.log('send:', data)
  channel.emit(WEBRTC_MESSAGE, data)
}

const configuration = { iceServers }
const offerOptions = { offerToReceiveAudio: false, offerToReceiveVideo: true }
const pc = new RTCPeerConnection(configuration)
pc.onicecandidate = ({ candidate }) => send({ candidate, id: channel.id })
pc.ontrack = event => {
  // event.streams[0] will contain the media stream
  console.log('onTrack')
}

const start = async () => {
  try {
    await pc.setLocalDescription(await pc.createOffer(offerOptions))
    send({ desc: pc.localDescription, id: channel.id })
  } catch (err) {
    console.error(err)
  }
}

const onmessage = async ({ desc, candidate, id }) => {
  try {
    console.log('onmessage:', id, desc, candidate)
    if (desc) {
      if (desc.type === 'offer') {
        // this is pure client, it should not handle offer message
        console.log('ignore offer')
      } else if (desc.type === 'answer') {
        // client should handle sdp answer
        await pc.setRemoteDescription(desc)
      } else {
        console.log('invalid sdp')
      }
    } else if (candidate) {
      await pc.addIceCandidate(candidate)
    }
  } catch (err) {
    console.error(err)
  }
}

// add some delay before web socket is connected
setTimeout(start, 1000)
