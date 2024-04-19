const Joi = require('joi')
const { getResponses, saveResponseBlob, updateResponseMetadata, deleteResponses  } = require('../storage/response-repo')

module.exports = [{
  method: 'POST',
  path: '/responses',
  options: {
    tags: ['api', 'responses'],
    validate: {
      payload: Joi.object({
        document_id: Joi.string().uuid().required(),
        llm: Joi.string().required(),
        user_prompt: Joi.string().allow('').required(),
        citations: Joi.array().required(),
        response: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const document_id = request.payload.document_id
    const llm = request.payload.llm
    const user_prompt = request.payload.user_prompt
    const citations = request.payload.citations
    const response = request.payload.response

    const data = {
      document_id,
      llm,
      user_prompt,
      citations,
      response
    }

    await addResponse(
      data
    )

    return h.response().code(201)
  }
},
{
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
  method: 'POST',
  path: '/responses/finalise',
  handler: async (request, h) => {
    const responses = await getResponses(request.payload.document_id)
    const latestResponseBuffer = Buffer.from(responses[0].response)

    const responseStorageOptions = {
      latestResponseBuffer,
      projectName: request.payload.project_name,
      documentId: request.payload.document_id
    }

    try {
      const savedLatestResponseBuffer = await saveResponseBlob(responseStorageOptions)
      return h.response(savedLatestResponseBuffer).code(201)
    } catch (err) {
      return h.response({ error: err.message }).code(500)
    }
  }
},
{
  method: 'PUT',
  path: '/responses/finalise/{projectName}/{documentId}',
  handler: async (request, h) => {
    const updateResponseMetadataOptions = {
      projectName: request.params.projectName,
      documentId: request.params.documentId
    }

    try {
      const status = await updateResponseMetadata(updateResponseMetadataOptions)
      return h.response(status).code(200)
    } catch (err) {
      if (err.code === 'NotFound') {
        return h.response().code(404).takeover()
      }

      throw err
    }
  }
},
{
  method: 'DELETE',
  path: '/responses/{docId}',
  options: {
    tags: ['api', 'responses'],
    validate: {
      params: Joi.object({
        docId: Joi.string().uuid().required()
      })
    }
  },
  handler: async (request, h) => {
    await deleteResponses(
      request.params.docId
    )

    return h.response().code(200)
  }
}]
