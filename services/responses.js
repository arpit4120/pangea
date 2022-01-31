const constants = require("./../properties/constants");

const messages = require("./../messages/messages");
const logg = require("./logging");
const Handlebars = require("handlebars");

function sendCustomSuccessResponse(resp, language, data, code, message) {
  const response = {
    statusCode: code || constants.responseCodes.SUCCESS,
    message:
      messages[language][message] ||
      messages[language][constants.commonResponseMessages.SUCCESS],
    data: data || {},
  };
  resp.type("json");
  return resp.send(JSON.stringify(response));
}

function updatesSuccess(resp, language, data, code, message) {
  const response = {
    statusCode: code || constants.responseCodes.SUCCESS,
    message:
      message || messages[language][constants.commonResponseMessages.UPDATED],
    data: data || {},
  };
  resp.type("json");
  return resp.send(JSON.stringify(response));
}

function sendCustomErrorResponse(resp, language, code, message, data) {
  logg.log("IN_SEND_ERROR=>", message);
  logg.log("messages_lang=>", language);
  logg.log("the_message=>", messages[language][message]);
  const response = {
    statusCode: code || constants.responseCodes.SOMETHING_WENT_WRONG,
    message:
      messages[language][message] ||
      messages[language][constants.commonResponseMessages.SOMETHING_WENT_WRONG],
    data: data || {},
  };

  resp.statusCode = code || constants.responseCodes.SOMETHING_WENT_WRONG;
  resp.type("json");

  return resp.send(JSON.stringify(response));
}

function sendCustomErrorResponseWithMessage(
  resp,
  language,
  code,
  message,
  data
) {
  const response = {
    statusCode: code || constants.responseCodes.SOMETHING_WENT_WRONG,
    message: message,
    data: data || {},
  };

  resp.statusCode = code || constants.responseCodes.SOMETHING_WENT_WRONG;
  resp.type("json");

  return resp.send(JSON.stringify(response));
}

function parameterMissingError(resp, language, code, message, data) {
  const response = {
    statusCode: code || constants.responseCodes.SOMETHING_WENT_WRONG,
    message:
      message ||
      messages[language][constants.commonResponseMessages.SOMETHING_WENT_WRONG],
    data: data || {},
  };
  resp.statusCode = code || constants.responseCodes.SOMETHING_WENT_WRONG;
  resp.type("json");
  return resp.send(JSON.stringify(response));
}

function sendQuarterResponseError(resp, language, code, message, validWeeks) {
  const response = {
    statusCode: code || constants.responseCodes.SOMETHING_WENT_WRONG,
    message:
      messages[language][message].replace("{VALID_WEEKS}", validWeeks) ||
      messages[language][constants.commonResponseMessages.SOMETHING_WENT_WRONG],
    data: data || {},
  };
  resp.type("json");
  return resp.send(JSON.stringify(response));
}

function sendCustomStripeErrorResponse(resp, language, code, message, data) {
  console.log("LANGUAGE=>", language);
  console.log("Message-=>", message);
  const response = {
    statusCode: code || constants.responseCodes.SOMETHING_WENT_WRONG,
    message:
      message ||
      messages[language][constants.commonResponseMessages.SOMETHING_WENT_WRONG],
    data: data || {},
  };

  resp.statusCode = code || constants.responseCodes.SOMETHING_WENT_WRONG;
  resp.type("json");

  return resp.send(JSON.stringify(response));
}

function sendCustomErrorWithValueResponse(resp, language, code, message, data) {
  logg.log("IN_SEND_ERROR=>", message);
  logg.log("messages_lang=>", language);
  logg.log("the_message=>", messages[language][message]);
  logg.log("data",data);
  const response = {
    statusCode: code || constants.responseCodes.SOMETHING_WENT_WRONG,
    message:
      messages[language][message] ||
      messages[language][constants.commonResponseMessages.SOMETHING_WENT_WRONG],
    data: data || {},
  };
  response.message=Handlebars.compile(response.message)({value:data});

  resp.statusCode = code || constants.responseCodes.SOMETHING_WENT_WRONG;
  resp.type("json");

  return resp.send(JSON.stringify(response));
}

module.exports = {
  sendCustomErrorWithValueResponse,
  sendCustomErrorResponse,
  sendCustomSuccessResponse,
  parameterMissingError,
  updatesSuccess,
  sendQuarterResponseError,
  sendCustomErrorResponseWithMessage,
  sendCustomStripeErrorResponse,
};
