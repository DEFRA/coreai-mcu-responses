describe('response message schema tests', () => {
  const { validateResponseMessage } = require('../../../../../app/messaging/inbound/responses/response-schema')

  test('valid message should return message body', () => {
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

    const value = validateResponseMessage(message.body)

    expect(value).toEqual(message.body)
  })

  test('missing body should throw error', () => {
    const message = {
      body: {
        source: 'test',
        type: 'test'
      }
    }

    expect(() => validateResponseMessage(message.body)).toThrow()
  })

  test('missing source should throw error', () => {
    const message = {
      body: {
        body: {
          document_id: '123e4567-e89b-12d3-a456-426614174000',
          llm: 'test',
          user_prompt: 'test',
          citations: ['test'],
          response: 'test'
        },
        type: 'test'
      }
    }

    expect(() => validateResponseMessage(message.body)).toThrow()
  })

  test('missing type should throw error', () => {
    const message = {
      body: {
        body: {
          document_id: '123e4567-e89b-12d3-a456-426614174000',
          llm: 'test',
          user_prompt: 'test',
          citations: ['test'],
          response: 'test'
        },
        source: 'test'
      }
    }

    expect(() => validateResponseMessage(message.body)).toThrow()
  })

  test('invalid document_id should throw error', () => {
    const message = {
      body: {
        body: {
          document_id: 'invalid',
          llm: 'test',
          user_prompt: 'test',
          citations: ['test'],
          response: 'test'
        },
        source: 'test',
        type: 'test'
      }
    }

    expect(() => validateResponseMessage(message.body)).toThrow()
  })
})
