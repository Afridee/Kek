const Joi = require('joi');

function validateArticle(articleCreation) {
    const schema = Joi.object({
      title : Joi.string().required(),
      subject: Joi.string().required(),
      body: Joi.string().required(),
      uid : Joi.string().required()
    }); 
    
    const validation =  schema.validate(articleCreation);

    return validation;
  }

exports.validateArticle = validateArticle;   