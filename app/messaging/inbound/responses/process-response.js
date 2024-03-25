const util = require('util')
const { validateResponseMessage } = require('../responses/response-schema')
const { addResponse } = require('../../../storage/response-repo')

const processResponse = async (message, receiver) => {
  try {
    const { body } = validateResponseMessage(message.body)

    console.log(`Processing response: ${util.inspect(body)}`)

    await addResponse(body)

    await receiver.completeMessage(message)
  } catch (err) {
    console.error(`Error processing response: ${err}`)

    await receiver.deadLetterMessage(message)
  }
}

module.exports = {
  processResponse
}
