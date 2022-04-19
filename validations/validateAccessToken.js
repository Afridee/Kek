const Joi = require('joi');

function validateAccessToken(AccessToken) {
    const schema = Joi.object({
        accessToken: Joi.string().required()
    }); 
    
    const validation =  schema.validate(AccessToken);

    return validation;
  }

exports.validateAccessToken = validateAccessToken;   