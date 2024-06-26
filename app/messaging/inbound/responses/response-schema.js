const Joi = require('joi')

const schema = Joi.object({
  document_id: Joi.string().uuid().required(),
  llm: Joi.string().required(),
  user_prompt: Joi.string().allow('').required(),
  citations: Joi.array().required(),
  response: Joi.string().required()
}).required()

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
