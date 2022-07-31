const Joi = require('joi');

function validateRidePayment(info) {
    const schema = Joi.object({
    email : Joi.string().email().required(),
    cus_id: Joi.string().required(), 
    paymentMethodId : Joi.string().required(),
    requestId : Joi.string().required(),
    }); 
    
    const validation =  schema.validate(info);

    return validation;
  }

exports.validateRidePayment = validateRidePayment;  