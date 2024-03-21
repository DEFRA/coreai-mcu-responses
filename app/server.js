require('./insights').setup()

const Hapi = require('@hapi/hapi')

async function createServer () {
  const server = Hapi.server({
    port: process.env.PORT
  })

  await server.register(require('./plugins/router'))

  return server
}

module.exports = createServer
