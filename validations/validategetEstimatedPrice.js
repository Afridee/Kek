const Joi = require('joi');

function validateGetEstimatedPrice(coordinates) {
    const schema = Joi.object({
      lat1: Joi.number().required(),
      lon1: Joi.number().required(),
      lat2: Joi.number().required(),
      lon2: Joi.number().required(),
    }); 
    
    const validation =  schema.validate(coordinates);

    return validation;
  }

exports.validateGetEstimatedPrice = validateGetEstimatedPrice;   