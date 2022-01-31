const Joi = require("joi");

const constants = require("./../properties/constants");
const responses = require("./responses");

function validateRequest(request, joiSchema, res, language) {
  console.log("request",request);
  
  const validation = Joi.validate(request, joiSchema);
  if (validation.error) {
    const error =
      validation.error.details && validation.error.details.length
        ? validation.error.details[0].message
        : constants.commonResponseMessages.INVALID_PARAMS;
    responses.parameterMissingError(
      res,
      language,
      constants.responseCodes.INVALID_PARAMS,
      error
    );
    return false;
  }
  return true;
};


module.exports = {
  validateRequest ,
};
