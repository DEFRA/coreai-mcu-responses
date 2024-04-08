require('./insights').setup()
require('log-timestamp')
const messaging = require('./messaging')
const createServer = require('./server')
const { initialiseTables } = require('./storage/response-repo')

const init = async () => {
  await initialiseTables()
  const server = await createServer()
  await server.start()
  console.log('Server running on %s', server.info.uri)
  await messaging.start()
}

process.on('SIGTERM', async () => {
  await messaging.stop()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await messaging.stop()
  process.exit(0)
})

init()
