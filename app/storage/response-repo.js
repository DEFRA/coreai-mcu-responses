const { odata } = require('@azure/data-tables')

const { getTableClient } = require('./get-table-client')
const tableConfig = require('../config/storage')

const tableClient = getTableClient(tableConfig.responseTable)
const maxDate = new Date(8640000000000000)

const invertTimestamp = (timestamp) => {
  const inverted = `${maxDate - timestamp}`

  return inverted.padStart(19, '0')
}

const enrichResponse = (response) => ({
  ...response,
  PartitionKey: response.document_id,
  RowKey: invertTimestamp(Date.now()),
  citations: JSON.stringify(response.citations)
})

const addResponse = async (response) => {
  const enrich = enrichResponse(response)
  await tableClient.createEntity(enrich)
}

const getResponses = async (docId) => {
  const query = tableClient.listEntities({
    queryOptions: {
      filter: odata`PartitionKey eq ${docId}`
    }
  })
  console.log(query)

  const responses = []

  for await (const entity of query) {
    responses.push(entity)
  }

  return responses
}

module.exports = {
  addResponse,
  getResponses
}
