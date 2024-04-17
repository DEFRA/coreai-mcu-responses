const { odata } = require('@azure/data-tables')

const { groupCitations } = require('../lib/citation-grouping')
const { getTableClient } = require('./get-table-client')
const { blobServiceClient } = require('./blob-service-client')

const config = require('../config/storage')
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

const getResponses = async (docId) => {
  const query = tableClient.listEntities({
    queryOptions: {
      filter: odata`PartitionKey eq ${docId}`
    }
  })

  const responses = []

  for await (const entity of query) {
    responses.push(formatResponse(entity))
  }

  return responses
}

const deleteResponses = async (docId) => {
  const query = tableClient.listEntities({
    queryOptions: {
      filter: odata`PartitionKey eq ${docId}`
    }
  })

  for await (const entity of query) {
    tableClient.deleteEntity(entity.partitionKey, entity.rowKey)
  }
}

const getNextBlobVersion = async (blobFolderName) => {
  let maxVersion = 0

  for await (const blob of responsesContainerClient.listBlobsByHierarchy('/', { prefix: `${blobFolderName}/` })) {
    const versionMatch = blob.name.match(/_([^_]+)\.[^.]+$/)

    if (versionMatch) {
      const version = parseInt(versionMatch[1])

      if (version > maxVersion) {
        maxVersion = version
      }
    }
  }

  return maxVersion + 1
}

const saveResponseBlob = async ({
  latestResponseBuffer,
  projectName,
  documentId
}) => {
  let version, blobName, blockBlobClient

  try {
    version = await getNextBlobVersion(projectName)

    blobName = `${projectName}/${documentId}_${version}.txt`
    blockBlobClient = responsesContainerClient.getBlockBlobClient(blobName)
  } catch (err) {
    console.error(err)
  }

  try {
    const options = {
      blobHTTPHeaders: {
        blobContentType: 'text/plain'
      }
    }

    await blockBlobClient.uploadData(latestResponseBuffer, options)
    console.log(`Response blob "${blobName}" has been uploaded successfully`)
    return latestResponseBuffer
  } catch (err) {
    console.error('Error uploading blob:', err)
    throw err
  }
}

const updateResponseMetadata = async ({ projectName, documentId }) => {
  const version = await getNextBlobVersion(projectName) - 1
  const blobName = `${projectName}/${documentId}_${version}.txt`
  const blockBlobClient = responsesContainerClient.getBlockBlobClient(blobName)

  if (!await blockBlobClient.exists()) {
    const err = new Error(`The response blob with the name ${blobName} does not exist`)

    err.code = 'NotFound'

    throw err
  }

  try {
    const metaData = {
      status: 'sent'
    }

    await blockBlobClient.setMetadata(metaData)
    console.log(`Metadata for blob "${blobName}" has been updated successfully`)

    return metaData
  } catch (err) {
    console.error('Error setting metadata:', err)
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
  saveResponseBlob,
  updateResponseMetadata
}
