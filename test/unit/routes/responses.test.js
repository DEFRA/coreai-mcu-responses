jest.mock('../../../app/storage/response-repo')

const responses = require('../../../app/routes/responses')
const { getResponses } = require('../../../app/storage/response-repo')

describe('/responses/{docId}', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return 200 if responses are found', async () => {
    const mockRequest = {
      params: {
        docId: '123e4567-e89b-12d3-a456-426614174000'
      }
    }
    const code = jest.fn()
    const response = jest.fn(() => {
      return {
        code
      }
    })
    const mockH = {
      response
    }

    getResponses.mockResolvedValue([{
      etag: "W/\"datetime'2024-03-25T14%3A31%3A29.1122849Z'\"",
      partitionKey: '123e4567-e89b-12d3-a456-426614174000',
      rowKey: '0008638288623005471',
      document_id: '123e4567-e89b-12d3-a456-426614174000',
      llm: 'xxx',
      user_prompt: 'xxx',
      citations: 'xxx',
      response: 'xxx',
      timestamp: '2024-03-25T14:31:29.1122849Z'
    }])

    await responses[0].handler(mockRequest, mockH)
    expect(response).toHaveBeenCalled()
    expect(code).toHaveBeenCalledWith(200)
  })
  test('should return 204 if responses are not found', async () => {
    const mockRequest = {
      params: {
        docId: '123e4567-e89b-12d3-a456-426614174000'
      }
    }
    const code = jest.fn()
    const response = jest.fn(() => {
      return {
        code
      }
    })
    const mockH = {
      response
    }

    getResponses.mockResolvedValue([])

    await responses[0].handler(mockRequest, mockH)
    expect(response).toHaveBeenCalled()
    expect(code).toHaveBeenCalledWith(204)
  })
})
