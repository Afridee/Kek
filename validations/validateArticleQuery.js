const Joi = require('joi');

function validateArticleQuery(query) {
    const schema = Joi.object({
      tags : Joi.array().items(Joi.string()).required()
    }); 
    
    const validation =  schema.validate(query);

    return validation;
  }

exports.validateArticleQuery = validateArticleQuery;   