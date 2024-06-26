describe('storage', () => {
  const DEFAULT_ENV = process.env

  let tableClient
  let defaultAzureCredential

  beforeEach(() => {
    jest.resetModules()

    jest.mock('@azure/data-tables')
    jest.mock('@azure/identity')

    tableClient = require('@azure/data-tables').TableClient
    defaultAzureCredential = require('@azure/identity').DefaultAzureCredential

    process.env = { ...DEFAULT_ENV }
  })

  afterAll(() => {
    process.env = DEFAULT_ENV
  })

  test('should use connection string if useConnectionString true', () => {
    process.env.AZURE_STORAGE_USE_CONNECTION_STRING = 'true'

    const { getTableClient } = require('../../../app/storage/get-table-client')

    getTableClient('responses')

    expect(tableClient.fromConnectionString).toHaveBeenCalledTimes(1)
    expect(tableClient).not.toHaveBeenCalled()
    expect(defaultAzureCredential).not.toHaveBeenCalled()
  })

  test('should use DefaultAzureCredential if useConnectionString false', () => {
    process.env.AZURE_STORAGE_USE_CONNECTION_STRING = 'false'

    const { getTableClient } = require('../../../app/storage/get-table-client')

    getTableClient('responses')

    expect(tableClient).toHaveBeenCalledTimes(1)
    expect(defaultAzureCredential).toHaveBeenCalledTimes(1)
    expect(tableClient.fromConnectionString).not.toHaveBeenCalled()
  })
})
