const { BlobServiceClient } = require('@azure/storage-blob')
const { DefaultAzureCredential } = require('@azure/identity')
const config = require('../config/storage')

const getBlobClient = () => {
  let blobServiceClient

  if (config.useConnectionString) {
    console.log('Using connection string for BlobServiceClient')
    blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString)
  } else {
    console.log('Using DefaultAzureCredential for BlobServiceClient')
    const uri = `https://${config.storageAccount}.blob.core.windows.net`
    blobServiceClient = new BlobServiceClient(uri, new DefaultAzureCredential({ managedIdentityClientId: process.env.AZURE_CLIENT_ID }))
  }

  return blobServiceClient
}

module.exports = {
  getBlobClient
}
