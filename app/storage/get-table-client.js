const { DefaultAzureCredential } = require('@azure/identity')
const { TableClient } = require('@azure/data-tables')
const tableConfig = require('../config/storage')

const getTableClient = (tableName) => {
  let tableClient

  if (tableConfig.useConnectionString) {
    console.log('Using connection string for Table Client')
    tableClient = TableClient.fromConnectionString(tableConfig.connectionString, tableName, { allowInsecureConnection: true })
  } else {
    console.log('Using DefaultAzureCredential for Table Client')
    tableClient = new TableClient(`https://${tableConfig.storageAccount}.table.core.windows.net`, tableName, new DefaultAzureCredential({ managedIdentityClientId: process.env.AZURE_CLIENT_ID }))
  }

  return tableClient
}

module.exports = {
  getTableClient
}
