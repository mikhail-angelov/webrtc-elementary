# WEBRTC Elementary

This repo contains very basic implementation of WebRTC communication.
It can help to understand how WebRTC works, and use those  samples in real applications.

`server.js` - minimal WebRTC signaling server, it does not support `rooms` so it can server only one WebRTC group. It serve static files (webrtc browser server/client) as well.

`test.js` - nodejs WebRTC client, which can be used to test multiple WebRTC connections without browsers. It uses [wrtc](https://github.com/node-webrtc/node-webrtc) library to enable WebRTC in nodejs.
`run.js` - simple runner, which run some instances of `test.js` tests and.

`static/index.html`,`static/main.js` - minimal WebRTC broadcast client, it can open video stream from web camera and broadcast to to other clients, it supports multiple connections.
It is exposed as `http://localhost:8080` if you run server locally.

`static/test.html`,`static/test.js` - minimal WebRTC broadcast client, it can connect to broadcast server above. It used for tests.
It is exposed as `http://localhost:8080/test.html` if you run server locally.

I used [this cool article](https://www.html5rocks.com/en/tutorials/webrtc/basics/) as reference.