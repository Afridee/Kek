const Joi = require('joi');

function validateRideRequestCreation(RideRequestCreation) {
    const schema = Joi.object({
        requestedBy: Joi.object({
        uid : Joi.string().required(),
        displayName : Joi.string().required(),
        email :  Joi.string().required(),
        phoneNumber : Joi.string().required()
      }).required(),
      pickUpFrom : Joi.string().required(),
      destination : Joi.string().required()
    }); 
    
    const validation =  schema.validate(RideRequestCreation);

    return validation;
  }

exports.validateRideRequestCreation = validateRideRequestCreation;   