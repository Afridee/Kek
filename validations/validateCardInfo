const Joi = require('joi');

function validateCardInfo(Card) {
    const schema = Joi.object({
    cus_id : Joi.string().required(),
    cardNumber: Joi.string().creditCard().required(),
    exp_month: Joi.number().integer().min(1).max(12).required(),
    exp_year: Joi.number().integer().min(2020).max(2100).required(),
    cvc: Joi.string().min(3).max(3).required()
    }); 
    
    const validation =  schema.validate(Card);

    return validation;
  }

exports.validateCardInfo = validateCardInfo;   