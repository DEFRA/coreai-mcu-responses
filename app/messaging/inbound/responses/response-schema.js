const Joi = require('joi')

const schema = Joi.object({
  body: Joi.object({
    document_id: Joi.string().uuid().required(),
    llm: Joi.string().required(),
    user_prompt: Joi.string().required(),
    citations: Joi.array().items(Joi.string()).required(),
    response: Joi.string().required()
  }).required(),
  source: Joi.string().required(),
  type: Joi.string().required()
})

const validateResponseMessage = (request) => {
  const { value, error } = schema.validate(request)

  if (error) {
    throw new Error(`Invalid response message: ${error.message}`)
  }

  return value
}

module.exports = {
  validateResponseMessage
}
