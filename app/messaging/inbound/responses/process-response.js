const util = require('util')
const { validateResponseMessage } = require('../responses/response-schema')

const processResponse = async (message, receiver) => {
  try {
    const { body } = validateResponseMessage(message.body)

    console.log(`Processing response: ${util.inspect(body)}`)

    await receiver.completeMessage(message)
  } catch (err) {
    console.error(`Error processing response: ${err.message}`)

    await receiver.deadLetterMessage(message)
  }
}

module.exports = {
  processResponse
}
