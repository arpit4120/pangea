const Promise = require("bluebird");
const Jwt = Promise.promisifyAll(require("jsonwebtoken"));

const constants = require("./../properties/constants");
const logging = require("./../services/logging");
const responses = require("./../services/responses");
//const autherisations = require("./../properties/autherisation");
const adminServices = require("./../modules/admin/adminServices/adminServices");
const customerServices = require("./../modules/customer/custServices/custServices");
async function createAccessToken(payload, time) {
  try {
    const expireTime = {
      expiresIn: time || constants.sessionData.EXPIRES_TIME,
    };
    const token = await Jwt.signAsync(
      payload,
      constants.sessionData.JWT_SECREKT_KEY,
      expireTime
    );

    logging.log("JWT_TOKEN=>", token);
    return token;
  } catch (error) {
    throw error;
  }
}

async function authenticateEnterprice(req, res, next) {
  try {
    req.enterpriceDetails = await adminServices.getEnterPriceData({
      enterpriceReferenceId:
        req.body.enterpriceReferenceId || req.query.enterpriceReferenceId,
    });

    if (!req.enterpriceDetails || !req.enterpriceDetails.length) {
      return responses.sendCustomErrorResponse(
        res,
        req.headers["content-language"],
        constants.responseCodes.AUTHENTICATION_ERROR,
        constants.commonResponseMessages.AUTHENTICATION_ERROR
      );
    }

    req.enterpriceDetails = req.enterpriceDetails[0];

    logging.log("language", req.headers["content-language"]);

    req.languageDetails = "en";

    if (!req.languageDetails || !req.languageDetails.length) {
      return responses.sendCustomErrorResponse(
        res,
        constants.defaultLanguage,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.INVALID_LANGUAGE
      );
    }
    req.languageDetails = req.languageDetails[0];

    next();
  } catch (error) {
    throw error;
  }
}

async function authenticateAccessToken(req, res, next) {
  try {
    req.headers["content-language"] =
      req.headers["content-language"] || constants.defaultLanguage;

    if (!req.headers["access-token"] && req.enterpriceDetails) {
      // OPEN API USED FOR QUEST USER AND ENTERPRICE IS AUTHENTICATED
      return next();
    }

    const decodedData = await Jwt.verify(
      req.headers["access-token"],
      constants.sessionData.JWT_SECREKT_KEY
    );
    logging.log("DECODED_DATA=>", decodedData);

    if (!decodedData) {
      return responses.sendCustomErrorResponse(
        res,
        req.headers["content-language"],
        constants.responseCodes.AUTHENTICATION_ERROR,
        constants.commonResponseMessages.AUTHENTICATION_ERROR
      );
    }

    if (!decodedData.enterpriceReferenceId) {
      return responses.sendCustomErrorResponse(
        res,
        req.headers["content-language"],
        constants.responseCodes.AUTHENTICATION_ERROR,
        constants.commonResponseMessages.AUTHENTICATION_ERROR
      );
    }

    req.enterpriceDetails = await adminServices.getEnterPriceData({
      enterpriceReferenceId: decodedData.enterpriceReferenceId,
    });
    if (!req.enterpriceDetails || !req.enterpriceDetails.length) {
      return responses.sendCustomErrorResponse(
        res,
        req.headers["content-language"],
        constants.responseCodes.AUTHENTICATION_ERROR,
        constants.commonResponseMessages.AUTHENTICATION_ERROR
      );
    }

    req.enterpriceDetails = req.enterpriceDetails[0];

    req.languageDetails ="en"

    if (!req.languageDetails || !req.languageDetails.length) {
      return responses.sendCustomErrorResponse(
        res,
        constants.defaultLanguage,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.INVALID_LANGUAGE
      );
    }
    req.languageDetails = req.languageDetails[0];

    switch (decodedData.userType) {
      case constants.userTypes.ADMIN:
        req.adminDetails = await adminServices.authenticateEmail({
          email: decodedData.email,
        });

        if (!req.adminDetails || !req.adminDetails.length) {
          return responses.sendCustomErrorResponse(
            res,
            req.headers["content-language"],
            constants.responseCodes.AUTHENTICATION_ERROR,
            constants.commonResponseMessages.AUTHENTICATION_ERROR
          );
        }
        req.adminDetails = req.adminDetails[0];

        if (
          req.adminDetails.adminId != req.enterpriceDetails.adminId &&
          req.adminDetails.isBlocked
        ) {
          return responses.sendCustomErrorResponse(
            res,
            req.headers["content-language"],
            constants.responseCodes.AUTHENTICATION_ERROR,
            constants.commonResponseMessages.SUBADMIN_BLOCKED
          );
        }

        req.timezone = -330;
        break;
      case constants.userTypes.CUSTOMER:
        req.customerDetails = await customerServices.getCustomer({
          adminId: req.enterpriceDetails.adminId,
          equalClause: {
            email: decodedData.email,
            customerId: decodedData.id,
          },
        });

        if (
          !req.customerDetails ||
          !req.customerDetails.length ||
          req.customerDetails[0].IsBlocked ||
          req.customerDetails.isDeleted
        ) {
          return responses.sendCustomErrorResponse(
            res,
            req.headers["content-language"],
            constants.responseCodes.AUTHENTICATION_ERROR,
            constants.commonResponseMessages.AUTHENTICATION_ERROR
          );
        }

        req.customerDetails = req.customerDetails[0];
        req.timezone = -330;

        break;
    }

    next();
  } catch (error) {
    console.log("Error==>", error);
    logging.logError("ERROR_WHILE_AUTHENTICATEING=>", error);
    return responses.sendCustomErrorResponse(
      res,
      req.headers["content-language"],
      constants.responseCodes.AUTHENTICATION_ERROR,
      constants.commonResponseMessages.AUTHENTICATION_ERROR
    );
  }
}

async function authTokenDetails(data) {
  try {
    data.headers["content-language"] =
      data.headers["content-language"] || constants.defaultLanguage;

    if (!data.headers["access-token"] && data.enterpriceDetails) {
      // OPEN API USED FOR QUEST USER AND ENTERPRICE IS AUTHENTICATED
      return 1;
    }

    const decodedData = await Jwt.verify(
      data.headers["access-token"],
      constants.sessionData.JWT_SECREKT_KEY
    );
    logging.log("DECODED_DATA=>", decodedData);

    if (!decodedData.enterpriceReferenceId) {
      return 0;
    }

    data.enterpriceDetails = await adminServices.getEnterPriceData({
      enterpriceReferenceId: decodedData.enterpriceReferenceId,
    });
    if (!data.enterpriceDetails || !data.enterpriceDetails.length) {
      return 0;
    }

    data.enterpriceDetails = data.enterpriceDetails[0];

    switch (decodedData.userType) {
      case constants.userTypes.ADMIN:
        data.adminDetails = await adminServices.authenticateEmail({
          email: decodedData.email,
        });

        if (!data.adminDetails || !data.adminDetails.length) {
          return 0;
        }
        data.adminDetails = data.adminDetails[0];

        break;
      case constants.userTypes.CUSTOMER:
        data.customerDetails = await customerServices.getCustomer({
          adminId: data.enterpriceDetails.adminId,
          equalClause: {
            email: decodedData.email,
          },
        });

        if (
          !data.customerDetails ||
          !data.customerDetails.length ||
          !data.customerDetails[0].isLoggedIn
        ) {
          return 0;
        }

        data.customerDetails = data.customerDetails[0];

        break;
    }
    return data;
  } catch (error) {
    logging.logError("ERROR_WHILE_AUTHENTICATEING=>", error);
    return 1;
  }
}

async function verifyTest() {
  try {
    console.log("in_verify_test");
    const token = await Jwt.decode(
      "ya29.Il-wB-yjJe4t_IKFkMvHsnDHwk7pYDG9NlUxPeiNkOK7H__yfBqjHWmClz-qmuimrXbtcfCPaaPL4pnKsmzLHllKvQyTZFE_T5yMrDdjLz0jXSeyJQ17SFmbEwNhM7_4vA",
      "awR5SAJG2Y9q9ySVpIDajIUV"
    );
    console.log("token=>", token);
  } catch (error) {
    console.log("errpr===>", error);
  }
}

async function authenticateGoodFleetEnterprice(req, res, next) {
  try {
    req.enterpriceDetails = await adminServices.getGoodFleetData({
      goodFleetApiKey:
        req.body.enterpriceReferenceId || req.query.enterpriceReferenceId,
    });

    if (!req.enterpriceDetails || !req.enterpriceDetails.length) {
      return responses.sendCustomErrorResponse(
        res,
        req.headers["content-language"],
        constants.responseCodes.AUTHENTICATION_ERROR,
        constants.commonResponseMessages.AUTHENTICATION_ERROR
      );
    }

    req.enterpriceDetails = req.enterpriceDetails[0];

    next();
  } catch (error) {
    throw error;
  }
}

verifyTest();

module.exports = {
  createAccessToken,
  authenticateAccessToken,
  authenticateEnterprice,
  authTokenDetails,
  authenticateGoodFleetEnterprice,
};
