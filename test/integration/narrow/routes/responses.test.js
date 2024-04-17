jest.mock('../../../../app/storage/response-repo')

const { getResponses } = require('../../../../app/storage/response-repo')

describe('Responses test', () => {
  const createServer = require('../../../../app/server')
  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /responses/{docId} route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/responses/bc6d63a3-4429-4df7-8800-e94d18bf46a4'
    }

    getResponses.mockResolvedValue([
      {
        document_id: 'bc6d63a3-4429-4df7-8800-e94d18bf46a4',
        llm: 'test',
        user_prompt: 'test',
        citations: ['test'],
        response: 'test'
      }
    ])

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
