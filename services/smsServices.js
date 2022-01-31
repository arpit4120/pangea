const constants = require("./../properties/constants");
const loggs = require("./logging");
const universalFunctions = require("./universanFucntions");
const requestPromise = require("request-promise");
const Promise = require("bluebird");
const mysqlService = require("./../databases/mysql/mysql");

function sendSmsViaTwilio(smsOptions) {
  return new Promise((resolve, reject) => {
    Promise.coroutine(function* () {
      const sql = `SELECT * FROM tb_twilio_keys WHERE adminId = ?`;
      const twilioKeys = yield mysqlService.runMysqlQueryPromisified(
        "GETTING_TWILIO_KEYS",
        sql,
        [smsOptions.adminId]
      );

      if (!twilioKeys || !twilioKeys.length) {
        loggs.log("TWILIO_KEY_NOT_PRESENT");
        return reject({});
      }

      loggs.log("TWILIO_CREDS", {
        SID: twilioKeys[0].sid,
        TOKEN: twilioKeys[0].token,
      });

      let client = require("twilio")(twilioKeys[0].sid, twilioKeys[0].token);
      smsOptions.from = twilioKeys[0].smsFromNumber;

      loggs.log("SMS_OPTIONS_BEFORE_SEND=>", smsOptions);
      client.messages.create(smsOptions, function (err, message) {
        loggs.log("SEND_SMS_TWILIO", { ERROR: err, Message: message });
        if (err) {
          return reject(constants.commonResponseMessages.FAILED_TO_SEND_SMS);
        }
        return resolve({});
      });
    })()
      .then(() => {})
      .catch((error) => {
        return reject(error);
      });
  });
}

function sendSmsVia2factor(opts) {
  return new Promise((resolve, reject) => {
    Promise.coroutine(function* () {
      const gatewayDetails = yield;
      const options = {
        uri: `http://2factor.in/API/V1/8b0d96ca-d7c4-11ea-9fa5-0200cd936042/SMS/${opts.phoneNumber}/${opts.otp}`,
        method: "GET",
        json: true,
      };
      yield requestPromise(options);
      return resolve({});
    })()
      .then(() => {})
      .catch((error) => {
        throw constants.commonResponseMessages.ERROR_WHILE_SENDING_MESSAGE;
      });
  });
}

/* examle opts object:  opts={phoneno,countrycode,gatewayType,smsType,language,body}  */
function sendSms(opts) {
  try {
    loggs.log("OPTS_IN_SEND_SMS=>", opts);
    let smsOptions = {
      from: "",
      to: opts.countryCode + opts.phoneNo.toString(),
      body: null,
      adminId: opts.adminId,
    };

    const notficationMessages = require("./../messages/notificationMessages")[
      opts.language || constants.defaultLanguage
    ];

    smsOptions.body = universalFunctions.renderMessages(
      notficationMessages[opts.smsType],
      opts.body
    );

    switch (opts.gatewayType) {
      case constants.gatewayType.TWILIO:
        return sendSmsViaTwilio(smsOptions);
      case constants.gatewayType.TWO_FACTOR:
        return sendSmsVia2factor(opts);
      default:
        throw constants.commonResponseMessages.NO_SMS_GATEWAY_SELECTED;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  sendSms,
};
