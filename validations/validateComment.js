const Joi = require('joi');

function validateComment(comment) {
    const schema = Joi.object({
        name : Joi.string().required(),
        id: Joi.string().required(),
        comment: Joi.string().required(),
    }); 
    
    const validation =  schema.validate(comment);

    return validation;
  }

exports.validateComment = validateComment;   