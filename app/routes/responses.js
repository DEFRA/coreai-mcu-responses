const Joi = require('joi')
const { getResponses, deleteResponses } = require('../storage/response-repo')

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
