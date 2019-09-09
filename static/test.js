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

const constraints = { audio: true, video: false }
const configuration = { iceServers }
const pc = new RTCPeerConnection(configuration)

// send any ice candidates to the other peer
pc.onicecandidate = ({ candidate }) => send({ candidate, id: channel.id })
// once remote track media arrives, show it in remote video element
pc.ontrack = event => {
  if (video.srcObject) return
  video.srcObject = event.streams[0]
}

const offerOptions = { offerToReceiveAudio: false, offerToReceiveVideo: true }
const start = async () => {
  try {
    await pc.setLocalDescription(await pc.createOffer(offerOptions))
    // send the offer to the other peer
    send({ desc: pc.localDescription, id: channel.id })
  } catch (err) {
    console.error(err)
  }
}

const onmessage = async ({ id, desc, candidate }) => {
  try {
    console.log('onmessage:',id,  desc, candidate)
    if (desc) {
      // if we get an offer, we need to reply with an answer
      if (desc.type === 'offer') {
        // ignore the offer, since it a client part
      } else if (desc.type === 'answer') {
        // set remote sdp on answer message
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

startButton.addEventListener('click', start)
