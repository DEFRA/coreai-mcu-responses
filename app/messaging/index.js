const { MessageReceiver } = require('ffc-messaging')
const { processResponse } = require('./inbound/responses/process-response')
const { responseProcessingQueue } = require('../config/messaging')

let responseReceiver

const start = async () => {
  const responseAction = message => processResponse(message, responseReceiver)
  responseReceiver = new MessageReceiver(responseProcessingQueue, responseAction)
  await responseReceiver.subscribe()

  console.info('Ready to receive messages')
}

const stop = async () => {
  await responseReceiver.closeConnection()
}

module.exports = { start, stop }
