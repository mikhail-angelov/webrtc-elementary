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
const startButton = document.getElementById('start')
const status = document.getElementById('status')
const video = document.getElementById('video')
const pcPool = {} // connection pool

startButton.addEventListener('click', start)
const updateCount = () => (status.textContent = Object.keys(pcPool).length)
const WEBRTC_MESSAGE = 'signal'
const channel = io.connect('/ws')
channel.on('connect', () => console.log('connected'))
channel.on('disconnect', () => console.log('disconnected'))
channel.on('error', e => console.log('error', e))
channel.on(WEBRTC_MESSAGE, data => onmessage(data))
const send = data => {
  console.log('send:', data)
  channel.emit(WEBRTC_MESSAGE, data)
}

const constraints = { audio: false, video: true }
const configuration = { iceServers }

async function start() {
  try {
    // get local stream, show it in self-view and add it to be sent
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream
  } catch (err) {
    console.error(err)
  }
}

const onDesc = async ({ desc, id }) => {
  console.log('onDesc:', desc, id)
  if (desc.type === 'offer') {
    // handle each offer and create new webrtc connection on it
    const pc = new RTCPeerConnection(configuration)
    pcPool[id] = pc
    updateCount()
    // send any ice candidates to the other peer
    pc.onicecandidate = ({ candidate }) => send({ id, candidate })
    pc.oniceconnectionstatechange = event => {
      // handle just disconnected message and remove it from connection pool
      if (event.target.connectionState == 'disconnected') {
        delete pcPool[id]
        updateCount()
      }
    }
    const stream = video.srcObject
    stream.getTracks().forEach(track => pc.addTrack(track, stream))
    await pc.setRemoteDescription(desc)
    await pc.setLocalDescription(await pc.createAnswer())
    send({ id, desc: pc.localDescription })
  } else if (desc.type === 'answer') {
    console.log('ignore answer')
  } else {
    console.log('Unsupported SDP type.')
  }
}
const onCandidate = async ({ candidate, id }) => {
  const pc = pcPool[id]
  if (pc) {
    await pc.addIceCandidate(candidate)
  }
}

const onmessage = ({ desc, candidate, id }) => {
  try {
    console.log('onmessage', id, desc, candidate)
    if (desc) {
      onDesc({ desc, id })
    } else if (candidate) {
      onCandidate({ id, candidate })
    }
  } catch (err) {
    console.error(err)
  }
}
