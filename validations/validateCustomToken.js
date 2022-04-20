const Joi = require('joi');

function validateCustomToken(CustomToken) {
    const schema = Joi.object({
        customToken: Joi.string().required()
    }); 
    
    const validation =  schema.validate(CustomToken);

    return validation;
  }

exports.validateCustomToken = validateCustomToken;   