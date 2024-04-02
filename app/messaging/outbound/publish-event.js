const { v4: uuidv4 } = require('uuid')
const { MessageSender } = require('ffc-messaging')
const { eventTopic } = require('../../config/messaging')
const { RESPONSE_PUBLISHED } = require('../../constants/events')

const createMessage = (data) => ({
  body: {
    specversion: '1.0',
    type: RESPONSE_PUBLISHED,
    source: 'coreai-mcu-responses',
    id: uuidv4(),
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    subject: 'response',
    data: {
      document_id: data.document_id,
      response: data.response
    }
  },
  type: RESPONSE_PUBLISHED,
  source: 'coreai-mcu-responses'
})

const publishResponseEvent = async (data) => {
  const sender = new MessageSender(eventTopic)

  const message = createMessage(data)

  await sender.sendMessage(message)
  await sender.closeConnection()
}

module.exports = {
  publishResponseEvent
}
