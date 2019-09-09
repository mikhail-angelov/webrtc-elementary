const { spawn } = require('child_process')
const CONNECTION_COUNT = 10
function run() {
  const app = spawn('node', ['test.js'])
  app.stdout.on('data', data => console.log(`stdout: ${data}`))
  app.stderr.on('data', data => console.error(`stderr: ${data}`))
  app.on('close', code => console.log(`child process exited with code ${code}`))
}

for (let i = 0; i < CONNECTION_COUNT; i++) {
  run()
}
