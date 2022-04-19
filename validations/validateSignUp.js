const Joi = require('joi');

function validateSignUp(signUpData) {
    const schema = Joi.object({
      email: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      password: Joi.string().required(),
      displayName: Joi.string().required(),
    }); 
    
    const validation =  schema.validate(signUpData);

    return validation;
  }

exports.validateSignUp = validateSignUp;   