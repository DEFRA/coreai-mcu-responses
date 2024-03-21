describe('response message process tests', () => {
  jest.mock('../../../../../app/messaging/inbound/responses/response-schema')

  const { validateResponseMessage } = require('../../../../../app/messaging/inbound/responses/response-schema')

  const { processResponse } = require('../../../../../app/messaging/inbound/responses/process-response')

  test('valid message should complete message', () => {
    const message = {
      body: {
        body: {
          document_id: '123e4567-e89b-12d3-a456-426614174000',
          llm: 'test',
          user_prompt: 'test',
          citations: ['test'],
          response: 'test'
        },
        source: 'test',
        type: 'test'
      }
    }

    const receiver = {
      completeMessage: jest.fn(),
      deadLetterMessage: jest.fn()
    }

    validateResponseMessage.mockReturnValue(message.body)

    processResponse(message, receiver)

    expect(receiver.completeMessage).toHaveBeenCalled()
  })

  test('message validation fail should dead letter message', () => {
    const receiver = {
      completeMessage: jest.fn(),
      deadLetterMessage: jest.fn()
    }

    validateResponseMessage.mockImplementation(() => {
      throw new Error('Invalid response message')
    })

    processResponse({ body: {} }, receiver)

    expect(receiver.completeMessage).not.toHaveBeenCalled()
    expect(receiver.deadLetterMessage).toHaveBeenCalled()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })
})
