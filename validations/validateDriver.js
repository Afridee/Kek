const Joi = require('joi');

function validateDriver(driverCreation) {
    const schema = Joi.object({
      name: Joi.string().required(),
      uid: Joi.string().required(),
      Driverexpirationdate : Joi.string().required(),
      Insurancepolicyexpirationdate : Joi.string().required(),
      Vehicleregistrationnumber : Joi.string().required(),
      Vehicleregistrationexpirationdate : Joi.string().required(),
      Socialsecuritynumber : Joi.string().required()
    }); 
    
    const validation =  schema.validate(driverCreation);

    return validation;
  }

exports.validateDriver = validateDriver;   