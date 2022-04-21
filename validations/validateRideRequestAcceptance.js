const Joi = require('joi');

function validateRideRequestAcceptance(RiderRequest) {
    const schema = Joi.object({
        requestId : Joi.string().required(),
        driverUID : Joi.string().required()
    }); 
    
    const validation =  schema.validate(RiderRequest);

    return validation;
  }

exports.validateRideRequestAcceptance = validateRideRequestAcceptance;   