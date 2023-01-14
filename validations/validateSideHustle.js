const Joi = require('joi');

function validateSideHustle(hustle) {
    const schema = Joi.object({
      title : Joi.string().required(),
      subject: Joi.string().required(),
      body: Joi.string().required(),
      uid : Joi.string().required(),
      name: Joi.string().required(),
      category : Joi.array().items(Joi.string()).required()
    }); 
    
    const validation =  schema.validate(hustle);

    return validation;
  }

exports.validateSideHustle = validateSideHustle;   