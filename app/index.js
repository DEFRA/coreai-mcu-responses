require('./insights').setup()
require('log-timestamp')
const messaging = require('./messaging')
const createServer = require('./server')
const { initialiseTables } = require('./storage/repos/responses')
const { initialiseContainer } = require('./storage/repos/finalised-responses')

const init = async () => {
  const server = await createServer()
  await server.start()

  if (process.env.INIT_STORAGE) {
    await initialiseTables()
    await initialiseContainer()
  }

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
