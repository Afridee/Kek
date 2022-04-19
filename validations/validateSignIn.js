const Joi = require('joi');

function validateSignIn(SignIn) {
    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required()
    }); 
    
    const validation =  schema.validate(SignIn);

    return validation;
  }

exports.validateSignIn = validateSignIn;   