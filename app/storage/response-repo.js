const { getTableClient } = require('./get-table-client')
const tableConfig = require('../config/storage')

const tableClient = getTableClient(tableConfig.responseTable)
const maxDate = new Date(8640000000000000)

const invertTimestamp = (timestamp) => {
  const inverted = `${maxDate - timestamp}`

  return inverted.padStart(19, '0')
}

const enrichResponse = (response) => {
  
}

const addResponse = async (response) => {

}

module.exports = {
  addResponse
}
