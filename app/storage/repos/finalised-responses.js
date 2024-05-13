const { getBlobClient } = require('../get-blob-client')

const config = require('../../config/storage')
const blobServiceClient = getBlobClient()
const containerClient = blobServiceClient.getContainerClient(config.responsesContainer)

const initialiseContainer = async () => {
  await containerClient.createIfNotExists()
}

const getNextBlobVersion = async (folderName) => {
  let maxVersion = 0

  for await (const blob of containerClient.listBlobsByHierarchy('/', { prefix: `${folderName}/` })) {
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
  const client = containerClient.getBlockBlobClient(name)

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

const saveFinalisedResponse = async (projectName, documentId, response) => {
  const version = await getNextBlobVersion(projectName)
  const name = `${projectName}/${documentId}_${version}.txt`
  const client = containerClient.getBlockBlobClient(name)

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
  initialiseContainer,
  getFinalisedResponse,
  saveFinalisedResponse
}
