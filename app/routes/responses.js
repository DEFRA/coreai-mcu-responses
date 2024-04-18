const Joi = require('joi')
const { addResponse, getResponses } = require('../storage/response-repo')

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

    return h.response().code(200)
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
    const responses = await getResponses(request.params.docId)

    if (responses.length === 0) {
      return h.response().code(204)
    }

    return h.response(responses).code(200)
  }
}]
