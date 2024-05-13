const { odata } = require('@azure/data-tables')

const { groupCitations } = require('../../lib/citation-grouping')
const { getTableClient } = require('../get-table-client')

const config = require('../../config/storage')
const tableClient = getTableClient(config.responseTable)
const maxDate = new Date(8640000000000000)

const initialiseTables = async () => {
  await tableClient.createTable()
}

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

const formatResponse = (response) => ({
  ...response,
  citations: groupCitations(JSON.parse(response.citations))
})

const addResponse = async (response) => {
  const enrich = enrichResponse(response)

  await tableClient.createEntity(enrich)
}

const getResponses = async (documentId) => {
  const query = tableClient.listEntities({
    queryOptions: {
      filter: odata`PartitionKey eq ${documentId}`
    }
  })

  const responses = []

  for await (const entity of query) {
    responses.push(formatResponse(entity))
  }

  return responses
}

const deleteResponses = async (documentId) => {
  const query = tableClient.listEntities({
    queryOptions: {
      filter: odata`PartitionKey eq ${documentId}`
    }
  })

  for await (const entity of query) {
    tableClient.deleteEntity(entity.partitionKey, entity.rowKey)
  }
}

module.exports = {
  addResponse,
  getResponses,
  initialiseTables,
  deleteResponses
}
