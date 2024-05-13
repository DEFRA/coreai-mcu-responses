const Joi = require('joi')
const { getResponses, saveResponseBlob, updateResponseMetadata, deleteResponses, getFinalisedResponse } = require('../storage/repos/responses')
const { coveragePathIgnorePatterns } = require('../../jest.config')

module.exports = [{
  method: 'GET',
  path: '/responses/{docId}',
  options: {
    validate: {
      params: Joi.object({
        docId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const responses = await getResponses(
      request.params.docId
    )

    if (responses.length === 0) {
      return h.response().code(204)
    }

    return h.response(responses).code(200)
  }
},
{
  method: 'GET',
  path: '/responses/finalise/{projectName}/{documentId}',
  handler: async (request, h) => {
    try {
      const { projectName, documentId } = request.params
      const response = await getFinalisedResponse(projectName, documentId)

      return h.response(response).code(200)
    } catch (err) {
      if (err.code === 'NotFound') {
        return h.response().code(404).takeover()
      }

      throw err
    }
  }
},
{
  method: 'POST',
  path: '/responses/finalise',
  options: {
    validate: {
      payload: Joi.object({
        projectName: Joi.string().required(),
        documentId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const { projectName, documentId } = request.payload

    let responses

    try {
      responses = await getResponses(documentId)
    } catch (err) {
      console.error('Error getting responses:', err)
      throw err
    }
    
    const { response } = responses[0]

    await saveResponseBlob(projectName, documentId, response)

    return h.response().code(201)
  }
},
{
  method: 'PUT',
  path: '/responses/finalise/{projectName}/{documentId}',
  options: {
    validate: {
      payload: Joi.object({
        response: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const { projectName, documentId } = request.params
    const { response } = request.payload

    await saveResponseBlob(projectName, documentId, response)

    return h.response().code(200)
  }
},
{
  method: 'DELETE',
  path: '/responses/{documentId}',
  options: {
    tags: ['api', 'responses'],
    validate: {
      params: Joi.object({
        documentId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    const { documentId } = request.params

    await deleteResponses(documentId)

    return h.response().code(200)
  }
}]
