const Joi = require('joi');

function validateSelfPromotion(data) {
    const schema = Joi.object({
      email: Joi.string().required(),
      name: Joi.string().required(),
      cus_id: Joi.string().required(),
      paymentMethodId: Joi.string().required(),
      amount: Joi.number().required(),
      about: Joi.string().required()
    }); 
    
    const validation =  schema.validate(data);

    return validation;
  }

exports.validateSelfPromotion = validateSelfPromotion;   