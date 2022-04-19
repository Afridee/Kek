const Joi = require('joi');

function validateDriver(driverCreation) {
    const schema = Joi.object({
      name: Joi.string().required()
    }); 
    
    const validation =  schema.validate(driverCreation);

    return validation;
  }

exports.validateDriver = validateDriver;   