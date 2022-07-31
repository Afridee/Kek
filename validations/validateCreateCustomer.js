const Joi = require('joi');

function validateCreateCustomer(stripeCustomer) {
    const schema = Joi.object({
    uid: Joi.string().required(),    
    name: Joi.string().required(),    
    email: Joi.string().required(),
    phone: Joi.string().required()
    }); 
    
    const validation =  schema.validate(stripeCustomer);

    return validation;
  }

exports.validateCreateCustomer = validateCreateCustomer;   