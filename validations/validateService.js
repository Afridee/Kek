const Joi = require('joi');

function validateService(data) {
    const schema = Joi.object({
      providedBy : Joi.string().required(),
      nameOfService: Joi.string().required(),
      description: Joi.string().required(),
    }); 
    
    const validation =  schema.validate(data);

    return validation;
  }

exports.validateService = validateService;   