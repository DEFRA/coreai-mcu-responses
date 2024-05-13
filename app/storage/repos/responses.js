const { odata } = require('@azure/data-tables')

const { groupCitations } = require('../../lib/citation-grouping')
const { getTableClient } = require('../get-table-client')
const { blobServiceClient } = require('../blob-service-client')

const config = require('../../config/storage')
const responsesContainerClient = blobServiceClient.getContainerClient(config.responsesContainer)
const tableClient = getTableClient(config.responseTable)
const maxDate = new Date(8640000000000000)

const initialiseTables = async () => {
  await tableClient.createTable()
}

const initialiseContainer = async () => {
  await responsesContainerClient.createIfNotExists()
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

const getNextBlobVersion = async (folder) => {
  let maxVersion = 0

  for await (const blob of responsesContainerClient.listBlobsByHierarchy('/', { prefix: `${folder}/` })) {
    const versionMatch = blob.name.match(/_([^_]+)\.[^.]+$/)

    if (versionMatch) {
      const version = parseInt(versionMatch[1])

      maxVersion = Math.max(maxVersion, version)
    }
  }

  return maxVersion + 1
}

const getFinalisedResponse = async (projectName, documentId) => {
  const version = await getNextBlobVersion(projectName) - 1
  const name = `${projectName}/${documentId}_${version}.txt`
  const client = responsesContainerClient.getBlockBlobClient(name)

  if (!await client.exists()) {
    const err = new Error(`The response blob with name ${name} does not exist`)

    err.code = 'NotFound'

    throw err
  }

  const buffer = await client.downloadToBuffer()

  const response = {
    response: buffer.toString(),
    version
  }

  return response
}

const saveResponseBlob = async (projectName, documentId, response) => {
  const version = await getNextBlobVersion(projectName)
  const name = `${projectName}/${documentId}_${version}.txt`
  const client = responsesContainerClient.getBlockBlobClient(name)

  try {
    const options = {
      blobHTTPHeaders: {
        blobContentType: 'text/plain'
      }
    }

    const buffer = Buffer.from(response)

    await client.uploadData(buffer, options)

    return response
  } catch (err) {
    console.error(`Failed to save response blob ${name}: ${err.message}`)
    throw err
  }
}

module.exports = {
  addResponse,
  getResponses,
  initialiseTables,
  initialiseContainer,
  deleteResponses,
  getNextBlobVersion,
  getFinalisedResponse,
  saveResponseBlob
}
