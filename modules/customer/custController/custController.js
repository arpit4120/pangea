
const loggs = require("./../../../services/logging");
const responses = require("./../../../services/responses");
const constants = require("./../../../properties/constants");
const customerServices = require("./../custServices/custServices");
const universalFunctions = require("./../../../services/universanFucntions");
const sessionManager = require("./../../../services/sessionManagement");
const mysqlService = require("./../../../databases/mysql/mysql");
const smsService = require("./../../../services/smsServices");

const Handlebars = require("handlebars");


async function registerCustomer(req, res) {
  const language = req.headers["content-language"] ||constants.defaultLanguage;
  req.body.language = language;
  try {
   // req.body.adminId = req.enterpriceDetails.adminId;
    if (req.body.socialId) {
      if (!req.body.socialMode) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.SOCIAL_MODE_REQUIRED
        );
      }
      if (req.body.password) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.PASSWORD_NOT_ALLOWED
        );
      }

     // req.body.timezone = 120;

      const customer = await customerServices.getCustomer({
        adminId: req.enterpriceDetails.adminId,
        equalClause: {
          socialId: req.body.socialId,
        },
      });

      if (customer && customer.length) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.DUPLICATE_CUTOMER_WITH_SOCIAL_MODE
        );
      }
    }

    if (req.body.email) {
      if (!universalFunctions.verifyEmailFormat(req.body.email)) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.INVALID_EMAIL_FORMAT
        );
      }

      const customer = await customerServices.getCustomer({
        adminId: req.enterpriceDetails.adminId,
        equalClause: {
          email: req.body.email,
        },
      });

      if (customer && customer.length) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.DUPLICATE_EMAIL_EXISTS
        );
      }
    }

    if (req.body.phoneNo) {
      const customer = await customerServices.getCustomer({
        adminId: req.enterpriceDetails.adminId,
        equalClause: {
          phoneNo: req.body.phoneNo,
        },
      });

      if (customer && customer.length) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.DUPLICATE_PHONE_EXISTS
        );
      }
    }


    if (req.body.userName) {
      const customer = await customerServices.getCustomer({
        adminId: req.enterpriceDetails.adminId,
        equalClause: {
          userName: req.body.userName,
        },
      });

      if (customer && customer.length) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.DUPLICATE_USERNAME_EXISTS
        );
      }
    }

    console.log("CHECK1==>", req.body.countryCode.indexOf("+"));

    console.log("CHECK2==>", isFinite(req.body.countryCode.substr(1)));

    if (
      req.body.countryCode.indexOf("+") != 0 ||
      !isFinite(req.body.countryCode.substr(1))
    ) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.INVALID_COUNTRY_CODE
      );
    }

   // req.body.timezone = 120;

    req.body.password
      ? (req.body.password = await universalFunctions.encryptPassword(
          req.body.password
        ))
      : 0;
    req.body.otpCode = universalFunctions.getRandomNumbers(4);
    console.log("otp=>", req.body.otp);
    var transactionConnection = await mysqlService.getConnectionPromisified();
    await mysqlService.startTransactionPromisified(transactionConnection);

    const insertedCustomer = await customerServices.insertCust(
      req.body,
      transactionConnection
    );
    // console.log(insertedCustomer)
    await mysqlService.commitTransactionPromisified(transactionConnection);
    if (!insertedCustomer.insertId) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.ACTION_FAILED
      );
    }

    // if (!req.enterpriceDetails.authViaFirebase) {
    //   await smsService.sendSms({
    //     adminId: req.enterpriceDetails.adminId,
    //     phoneNo: req.body.phoneNo,
    //     countryCode: req.body.countryCode,
    //     gatewayType: constants.gatewayType.TWILIO,
    //     smsType: constants.smsNotificationsTypes.VERFICATION_CODE_MESSAGE,
    //     language: language,
    //     body: {
    //       application: req.enterpriceDetails.name,
    //       four_digit_verification_code: req.body.otpCode,
    //     },
    //   });
    // }

    const customer = await customerServices.getCustomer(
      {
        equalClause: {
          customerId: insertedCustomer.insertId,
        },
      }
    );
   // await mysqlService.commitTransactionPromisified(transactionConnection);

    // if (!customer || !customer.length) {
    //   return responses.sendCustomErrorResponse(
    //     res,
    //     language,
    //     constants.responseCodes.COMMON_ERROR_CODE,
    //     constants.commonResponseMessages.ACTION_FAILED
    //   );
    // }

    //await mysqlService.commitTransactionPromisified(transactionConnection);

    const tokenPayload = {
      id: customer[0].customerId,
      email: customer[0].email,
      userType: constants.userTypes.CUSTOMER,
      enterpriceReferenceId: req.enterpriceDetails.enterpriceReferenceId,
    };

    customer[0].accessToken = await sessionManager.createAccessToken(
      tokenPayload
    );
    delete customer[0].password;

    return responses.sendCustomSuccessResponse(res, language, customer[0]);
  } catch (error) {
    loggs.logError("error_while_registration", error);
    if (transactionConnection) {
      await mysqlService.rollbackTransactionPromisified(transactionConnection);
    }

    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      error
    );
  }
}

async function updateCustomer(req, res) {
  const language = req.headers["content-language"];
  req.body.language = language;
  try {
    if (!req.customerDetails) {
      if (!req.body.customerId) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.CUSTOMER_ID_REQUIRED
        );
      }
      req.customerDetails = {
        customerId: req.body.customerId,
      };
    }

    if (req.body.email) {
      const customer = await customerServices.getCustomer({
        //adminId: req.enterpriceDetails.adminId,
        equalClause: {
          email: req.body.email,
        },
        notEqualClause: {
          customerId: req.customerDetails.customerId,
        },
      });

      if (customer && customer.length) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.DUPLICATE_EMAIL_EXISTS
        );
      }
    }

    if (req.body.phoneNo) {
      const customer = await customerServices.getCustomer({
        adminId: req.enterpriceDetails.adminId,
        equalClause: {
          phoneNo: req.body.phoneNo,
        },
        notEqualClause: {
          customerId: req.customerDetails.customerId,
        },
      });

      if (customer && customer.length) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.DUPLICATE_PHONE_EXISTS
        );
      }
    }
    loggs.log("REQ_BODY_FILE=>", req.files);
    if (req.files && req.files.file) {
      req.file = req.files.file;
      if (req.file && req.file.size && req.file.size > 5000000)
        //check file size to be 5 mb
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.FILE_SIZE_EXCEEDS
        );

      const s3ImageData = await universalFunctions.uploadS3Image(req.files); // upload image
      loggs.log("S2_IMAGE_DATA=>", s3ImageData);
      if (!s3ImageData) {
        // checks upload response
        console.log("got s3ImageData");
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.FAILED_TO_UPLOAD_IMAGE
        );
      }

      req.body.profilePicURL = `${config.get("s3Config.S3URL")}${config.get(
        "s3Config.folders.IMAGES"
      )}/${s3ImageData}`;
    }

    if (req.body.password) {
      req.body.password = await universalFunctions.encryptPassword(
        req.body.password
      );
    }

    req.body.phoneVerified = 1;
    req.body.isUpdated = 1;

    await customerServices.updateCustomer(
      req.body,
      req.customerDetails.customerId
    );

    // if (req.body.customerReferralCode) {
    //   let refferalCheck = await customerServices.checkCustomerRefferal({
    //     referralCode: req.body.customerReferralCode,
    //   });

    //   if (
    //     !refferalCheck ||
    //     !refferalCheck.length ||
    //     !refferalCheck[0].customerId
    //   ) {
    //     return responses.sendCustomErrorResponse(
    //       res,
    //       language,
    //       constants.responseCodes.COMMON_ERROR_CODE,
    //       constants.commonResponseMessages.INVALID_REFFERAL_CODE
    //     );
    //   }

    //   transactionConnection = await mysqlService.getConnectionPromisified();
    //   await mysqlService.startTransactionPromisified(transactionConnection);

    //   await customerServices.applyRefferalCode(
    //     {
    //       referralCode: req.body.customerReferralCode,
    //       customerId: req.customerDetails.customerId,
    //       adminId: req.enterpriceDetails.adminId,
    //     },
    //     transactionConnection
    //   );

    //   await mysqlService.commitTransactionPromisified(transactionConnection);
    // }

    return responses.sendCustomSuccessResponse(res, language, {});
  } catch (error) {
    loggs.logError("UPDATE_CUSTOMER_PROFILE", error);
    if (transactionConnection) {
      await mysqlService.rollbackTransactionPromisified(transactionConnection);
    }

    return responses.sendCustomErrorResponse(res, language);
  }
}

async function customerLogin(req, res) {
  const language = req.headers["content-language"] || constants.defaultLanguage;
  try {
    // req.enterpriceDetails.adminId = 1;
    let customerDetails;

    if (req.body.socialId) {
      customerDetails = await customerServices.getCustomer({
        adminId: req.enterpriceDetails.adminId,
        equalClause: {
          socialId: req.body.socialId,
        },
      });

      if (!customerDetails || !customerDetails.length) {
        return responses.sendCustomSuccessResponse(res, language, {
          socialId: req.body.socialId,
        });
      }
    } else if (req.body.email && !Number(req.body.email)) {
      // login case via phone and email
      customerDetails = await customerServices.getCustomer({
        adminId: req.enterpriceDetails.adminId,
        equalClause: {
          email: req.body.email,
        },
      });

      if (!customerDetails || !customerDetails.length) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.INVALID_EMAIL
        );
      }
    } else if (req.body.phoneNo || Number(req.body.email)) {
      !req.body.phoneNo ? (req.body.phoneNo = Number(req.body.email)) : 0;
      customerDetails = await customerServices.getCustomer({
        adminId: req.enterpriceDetails.adminId,
        equalClause: {
          phoneNo: req.body.phoneNo,
          countryCode: req.body.countryCode,
        },
      });

      if (!customerDetails || !customerDetails.length) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.INVALID_CREDENTAILS
        );
      }
    } else {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.LOGIN_PARAM_MISSING
      );
    }

    let changePassword = false;

    if (!req.body.socialId) {
      checkedPassword = await universalFunctions.checkPassword(
        req.body.password,
        customerDetails[0].password
      );

      if (!checkedPassword) {
        // for existing live users having wordpress encryption
        checkedPassword = await universalFunctions.decryptWordpressPassword(
          req.body.password,
          customerDetails[0].password
        );
        if (!checkedPassword) {
          return responses.sendCustomErrorResponse(
            res,
            language,
            constants.responseCodes.COMMON_ERROR_CODE,
            constants.commonResponseMessages.INCORRECT_PASSWORD
          );
        }

        req.body.password = await universalFunctions.encryptPassword(
          req.body.password
        );
        changePassword = true;
      }
    }

    if (customerDetails[0].isBlocked) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.CUSTOMER_BLOCKED
      );
    }
    if (!customerDetails[0].phoneVerified) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.CUSTOMER_BLOCKED
      );
    }

    var transactionConnection = await mysqlService.getConnectionPromisified();

    await mysqlService.startTransactionPromisified(transactionConnection);

    const customerFieldsToUpdate = {
      //deviceToken: req.body.deviceToken,
      //deviceType: req.body.deviceType,
      //latitude: req.body.latitude,
      //longitude: req.body.longitude,
      isLoggedIn: 1,
      timezone: req.body.timezone,
    };

    if (changePassword) {
      customerFieldsToUpdate.password = req.body.password;
    }

    loggs.log("CUSTOMER_FIELDS_TO_UPDATE=>", customerFieldsToUpdate);

    await customerServices.updateCustomer(
      customerFieldsToUpdate,
      customerDetails[0].customerId,
      transactionConnection
    );

    // if (req.body.deviceToken) {
    //   await customerServices.unsetDeviceTokens(
    //     {
    //       deviceToken: req.body.deviceToken,
    //       customerId: customerDetails[0].customerId,
    //     },
    //     transactionConnection
    //   );
    // }

    const tokenPayload = {
      id: customerDetails[0].customerId,
      email: customerDetails[0].email,
      userType: constants.userTypes.CUSTOMER,
      enterpriceReferenceId: req.enterpriceDetails.enterpriceReferenceId,
    };

    customerDetails[0]["accessToken"] = await sessionManager.createAccessToken(
      tokenPayload
    );

    await mysqlService.commitTransactionPromisified(transactionConnection);

    delete customerDetails[0].password;

    return responses.sendCustomSuccessResponse(
      res,
      language,
      customerDetails[0]
    );
  } catch (error) {
    loggs.logError("error_while_admin_login", error);
    if (transactionConnection) {
      await mysqlService.rollbackTransactionPromisified(transactionConnection);
    }

    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      error
    );
  }
}

async function customerLogout(req, res) {
  try {
    var language = req.headers["content-language"] || constants.defaultLanguage;
    const updatedCustomer = await customerServices.updateCustomer(
      {
       // deviceToken: null,
        //deviceType: null,
        isLoggedIn: 0,
      },
      req.customerDetails.customerId
    );

    if (updatedCustomer.affectedRows) {
      return responses.sendCustomSuccessResponse(res, language, {});
    } else {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.ACTION_FAILED
      );
    }
  } catch (error) {
    loggs.logError("CUSTOMER_LOGOUT", error);
    return responses.sendCustomErrorResponse(res, language);
  }
}

async function verifyOtp(req, res) {
  try {
    var language = req.headers["content-language"] || constants.defaultLanguage;

    const session = await customerServices.getCustomer({
      adminId: req.customerDetails.adminId,
      equalClause: {
        //phoneNo: req.body.phoneNo,
        email:req.body.email
      },
    });
    if (!session || !session.length) {
      throw constants.commonResponseMessages.ACTION_FAILED;
    }

    let obj = {
      phoneVerified: 1,
      //phoneNo: req.body.phoneNo,
      //countryCode: req.body.countryCode,
    };

    // if (!req.body.verifiedViaFirebase) {
      if (session[0].OTPCode != req.body.otpCode) {
        console.log("otp entered is invalid");
        throw constants.commonResponseMessages.INVALID_OTP_CODE;
      }

    const updatedCustomer = await customerServices.updateCustomer(
      obj,
      req.customerDetails.customerId
    );

    if (updatedCustomer.affectedRows) {
      return responses.sendCustomSuccessResponse(res, language, {});
    } else {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.ACTION_FAILED
      );
    }
  } catch (error) {
    loggs.logError("VERIFY_OTP", error);
    return responses.sendCustomErrorResponse(res, language);
  }
}

async function resendOtp(req, res) {
  try {
    console.log("inside resend otp function");
    var language = req.headers["content-language"] || constants.defaultLanguage;

    var transactionConnection = await mysqlService.getConnectionPromisified();

    await mysqlService.startTransactionPromisified(transactionConnection);

    let otpCode = universalFunctions.getRandomNumbers(4);

    await customerServices.updateCustomer(
      {
        otpCode: otpCode,
      },
      req.customerDetails.customerId,
      transactionConnection
    );

    // await smsService.sendSms({
    //   adminId: req.enterpriceDetails.adminId,
    //   phoneNo: req.customerDetails.phoneNo,
    //   countryCode: req.customerDetails.countryCode,
    //   gatewayType: constants.gatewayType.TWILIO,
    //   smsType: constants.smsNotificationsTypes.VERFICATION_CODE_MESSAGE,
    //   language: language,
    //   body: {
    //     application: req.enterpriceDetails.name,
    //     four_digit_verification_code: otpCode,
    //   },
    // });
    // console.log(
    //   "smsservice ============================>",
    //   req.enterpriceDetails.adminId,
    //   ",",
    //   req.customerDetails.phoneNo,
    //   ",",
    //   req.customerDetails.countryCode,
    //   ",",
    //   constants.gatewayType.TWILIO,
    //   ",",
    //   constants.smsNotificationsTypes.VERFICATION_CODE_MESSAGE,
    //   ",",
    //   otpCode
    // );

    await mysqlService.commitTransactionPromisified(transactionConnection);

    return responses.sendCustomSuccessResponse(res, language, {});
  } catch (error) {
    loggs.logError("RESEND_OTP", error);
    if (transactionConnection) {
      await mysqlService.rollbackTransactionPromisified(transactionConnection);
    }
    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      constants.commonResponseMessages.UNABLE_TO_RESEND_OTP
    );
  }
}

// async function resendOtp(req, res) {
//   try {
//     console.log("inside resend otp function");
//     var language = req.headers["content-language"] || constants.defaultLanguage;

//     var transactionConnection = await mysqlService.getConnectionPromisified();

//     await mysqlService.startTransactionPromisified(transactionConnection);

//     let otpCode = universalFunctions.getRandomNumbers(4);

//     await customerServices.updateCustomer(
//       {
//         otpCode: otpCode,
//       },
//       req.customerDetails.customerId,
//       transactionConnection
//     );
//       //email check
//     // await smsService.sendSms({
//     //   adminId: req.enterpriceDetails.adminId,
//     //   phoneNo: req.customerDetails.phoneNo,
//     //   countryCode: req.customerDetails.countryCode,
//     //   gatewayType: constants.gatewayType.TWILIO,
//     //   smsType: constants.smsNotificationsTypes.VERFICATION_CODE_MESSAGE,
//     //   language: language,
//     //   body: {
//     //     application: req.enterpriceDetails.name,
//     //     four_digit_verification_code: otpCode,
//     //   },
//     // });
//     // console.log(
//     //   "smsservice ============================>",
//     //   req.enterpriceDetails.adminId,
//     //   ",",
//     //   req.customerDetails.phoneNo,
//     //   ",",
//     //   req.customerDetails.countryCode,
//     //   ",",
//     //   constants.gatewayType.TWILIO,
//     //   ",",
//     //   constants.smsNotificationsTypes.VERFICATION_CODE_MESSAGE,
//     //   ",",
//     //   otpCode
//     // );

//     await mysqlService.commitTransactionPromisified(transactionConnection);

//     return responses.sendCustomSuccessResponse(res, language, {});
//   } catch (error) {
//     loggs.logError("RESEND_OTP", error);
//     if (transactionConnection) {
//       await mysqlService.rollbackTransactionPromisified(transactionConnection);
//     }
//     return responses.sendCustomErrorResponse(
//       res,
//       language,
//       constants.responseCodes.COMMON_ERROR_CODE,
//       constants.commonResponseMessages.UNABLE_TO_RESEND_OTP
//     );
//   }
// }

async function getMyProfile(req, res) {
  try {
    var language = req.headers["content-language"] || constants.defaultLanguage;
    req.customerDetails.accessToken = req.body["access-token"];

    // loggs.log("DATA_JUST_BEFORE-->", req.enterpriceDetails);


    return responses.sendCustomSuccessResponse(
      res,
      language,
      req.customerDetails || {}
    );
  } catch (error) {
    loggs.logError("GET_MY_PROFILE", error);
    return responses.sendCustomErrorResponse(res, language);
  }
}
async function customerForgotPassword(req, res) {
  try {
    var language = req.headers["content-language"];

    var transactionConnection = await mysqlService.getConnectionPromisified();

    await mysqlService.startTransactionPromisified(transactionConnection);

    let customer = await customerServices.getCustomer({
      adminId: req.enterpriceDetails.adminId,
      equalClause: {
        emailId:req.query.emailId
      },
    });

    if (!customer || !customer.length) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.INVALID_PHONE_NUMBER
      );
    }

    customer = customer[0];

    let passwordResetToken = universalFunctions.generateRandomString(5);

    await customerServices.updateCustomer(
      {
        passwordResetToken: passwordResetToken,
        language: language,
      },
      customer.customerId,
      transactionConnection
    );
    console.log(req.enterpriceDetails.forgotPasswordLink);

    const forgotPasswordLink = universalFunctions.renderMessages(
      req.enterpriceDetails.forgotPasswordLink,
      {
        passwordResetToken: passwordResetToken,
      }
    );
    //email

    // await smsService.sendSms({
    //   adminId: req.enterpriceDetails.adminId,
    //   phoneNo: req.body.phoneNo,
    //   countryCode: req.body.countryCode,
    //   gatewayType: constants.gatewayType.TWILIO,
    //   smsType: constants.smsNotificationsTypes.FORGOT_PASSWORD_LINK,
    //   language: language,
    //   body: {
    //     application: req.enterpriceDetails.name,
    //     forgotPasswordLink,
    //     customerName: customer.firstName,
    //   },
    // });

    await mysqlService.commitTransactionPromisified(transactionConnection);

    loggs.log("BEFORE_SUCCESS=>", language);

    return responses.sendCustomSuccessResponse(res, language, {});
  } catch (error) {
    loggs.logError("CUSTOMER_FROGOT_PASSWORD", error);
    if (transactionConnection) {
      await mysqlService.rollbackTransactionPromisified(transactionConnection);
    }
    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      error
    );
  }
}

async function changePassword(req, res) {
  try {
    var language = req.headers["content-language"];
    const checkedPassword = await universalFunctions.checkPassword(
      req.body.oldPassword,
      req.customerDetails.password
    );

    if (!checkedPassword) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.INCORRECT_PASSWORD
      );
    }

    req.body.newPassword = await universalFunctions.encryptPassword(
      req.body.newPassword
    );

    await customerServices.updateCustomer(
      {
        password: req.body.newPassword,
      },
      req.customerDetails.customerId
    );

    return responses.sendCustomSuccessResponse(
      res,
      language,
      {},
      constants.responseCodes.SUCCESS,
      constants.commonResponseMessages.PASSWORD_CHANGED
    );
  } catch (error) {
    loggs.logError("CHANGE_PASSWORD_ERROR", error);
    return responses.sendCustomErrorResponse(res, language);
  }
}

async function verifyOtpForForgotPassword(req, res) {
  try {
    var language = req.headers["content-language"] || constants.defaultLanguage;

    const customerDetails = await customerServices.verifyResetPassToken({
      passwordResetToken: req.body.passwordResetToken,
    });

    if (!customerDetails || !customerDetails.length) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.INVALID_RESET_PASSWORD_TOKEN
      );
    }

    req.body.password = await universalFunctions.encryptPassword(
      req.body.password
    );

    await customerServices.updateCustomer(
      {
        password: req.body.password,
      },
      customerDetails[0].customerId
    );

    return responses.sendCustomSuccessResponse(res, language, {});
  } catch (error) {
    loggs.logError("VERIFY_FORGOT_PASSWORD", error);
    return responses.sendCustomErrorResponse(res, language);
  }
}


async function createPost(req, res) {
  const language = req.headers["content-language"];
  req.body.language = language;
  try {

    var transactionConnection = await mysqlService.getConnectionPromisified();
    await mysqlService.startTransactionPromisified(transactionConnection);

    //req.body.fromCustomer ? (req.body.isLoggedIn = 1) : 0;
    let Datetime = universalFunctions.convertTimeIntoLocal(
      new Date(),
      req.timezone
    );

    dataforPost={
      customerId :req.customerDetails.customerId,
      userName:req.customerDetails.userName,
      photo:req.body.photoUrl,
      description:req.body.description,
      createdAt:Datetime
    }

    const insertedPost = await customerServices.createPost(
      dataforPost,
      transactionConnection
    );
    await mysqlService.commitTransactionPromisified(transactionConnection);
    if (!insertedPost.insertId) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.ACTION_FAILED
      );
    }
    myEmitter.emit("new_post", dataforPost);
    return responses.sendCustomSuccessResponse(res, language,{});
  } catch (error) {
    loggs.logError("error_creating_new_post", error);
    if (transactionConnection) {
      await mysqlService.rollbackTransactionPromisified(transactionConnection);
    }

    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      error
    );
  }
}

async function likePost(req, res) {
  const language = req.headers["content-language"];
  req.body.language = language;
  try {

    //var transactionConnection = await mysqlService.getConnectionPromisified();
    //await mysqlService.startTransactionPromisified(transactionConnection);

    if(!req.customerDetails)
    {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.CUSTOMER_ID_REQUIRED
        );
    }

    const likedPost = await customerServices.likePost(
      req.body
    );
    //await mysqlService.commitTransactionPromisified(transactionConnection);
    if (!likedPost.affectedRows) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.ACTION_FAILED
      );
    }
    //var transactionConnection = await mysqlService.getConnectionPromisified();
    //await mysqlService.startTransactionPromisified(transactionConnection);

    const addToLikedPost =await customerServices.addToLikedPost(req.body);
    //await mysqlService.commitTransactionPromisified(transactionConnection);
    if(!addToLikedPost.affectedRows)
    {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.ACTION_FAILED
      );
    }
    //await mysqlService.commitTransactionPromisified(transactionConnection);
    return responses.sendCustomSuccessResponse(res, language,{});
  } catch (error) {
    loggs.logError("error_creating_new_post", error);
    // if (transactionConnection) {
    //   await mysqlService.rollbackTransactionPromisified(transactionConnection);
    // }

    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      error
    );
  }
}

async function follow(req, res) {
  const language = req.headers["content-language"];
  req.body.language = language;
  try {

    var transactionConnection = await mysqlService.getConnectionPromisified();
    await mysqlService.startTransactionPromisified(transactionConnection);

    if(!req.customerDetails)
    {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.CUSTOMER_ID_REQUIRED
        );
    }
    var transactionConnection = await mysqlService.getConnectionPromisified();
    await mysqlService.startTransactionPromisified(transactionConnection);

    const customer = await customerServices.getCustomer(
      {equalClause:{customerId:req.body.customerId}},
      transactionConnection
    );

    await mysqlService.commitTransactionPromisified(transactionConnection);

    var transactionConnection = await mysqlService.getConnectionPromisified();
    await mysqlService.startTransactionPromisified(transactionConnection);

    // if (customer && customer.length) {
    //   return responses.sendCustomErrorResponse(
    //     res,
    //     language,
    //     constants.responseCodes.COMMON_ERROR_CODE,
    //     constants.commonResponseMessages.CUSTOMER_ID_REQUIRED
    //   );
    // }
    console.log("check");
    const addToFollow =await customerServices.addToFollow(req.body,req.customerDetails.customerId,transactionConnection);
    if(!addToFollow.affectedRows)
    {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.ACTION_FAILED
      );
    }


    await mysqlService.commitTransactionPromisified(transactionConnection);
    return responses.sendCustomSuccessResponse(res, language,{});
  } catch (error) {
    loggs.logError("error_creating_new_post", error);
    // if (transactionConnection) {
    //   await mysqlService.rollbackTransactionPromisified(transactionConnection);
    // }

    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      error
    );
  }
}

async function getPost(req, res) {
  var language = req.headers["content-language"];

  try {

  let criteria = {
    equalClause: {
      customerId:req.querry.customerId
    },
  };
  

  loggs.log("CRITERIA==>", criteria);
  if(req.query.type===1)
  {
    criteria.likes = 1;
    criteria.columns = " COUNT (DISTINCT post.postId ) AS count ";
  }
  else
  {
    criteria.likes =0;
    criteria.columns = " COUNT (DISTINCT post.postId ) AS count ";
  }
  const totalPost = await customerServices.getProfilePosts(criteria)//getBookingsWithJoins(criteria);

  const response = {
    totalPost:
      totalPost && totalPost.length && totalPost[0].count
        ? totalPost[0].count
        : 0,
    totalPosts: [],
  };

  if (response.totalPost) {
    criteria.columns = `post.* `;
    criteria.type=req.query.type;
    criteria.limit = parseInt(req.query.limit) || 20;
    criteria.skip = parseInt(req.query.skip) || 0;

    response.totalPosts = await customerServices.getProfilePosts(//getBookingsWithJoins(
      criteria
    );
  }

  return responses.sendCustomSuccessResponse(res, language, response);
} catch (error) {
  loggs.logError("ERROR_GET_ALL_ORDERS", error);
  return responses.sendCustomErrorResponse(
    res,
    language,
    constants.responseCodes.COMMON_ERROR_CODE,
    constants.commonResponseMessages.SOMETHING_WENT_WRONG,
    {}
  );
}
}


async function getExplorePost(req, res) {
  var language = req.headers["content-language"];
  try {
  let criteria = {
    equalClause: {
    },
  };

  loggs.log("CRITERIA==>", criteria);
  if(req.query.customerId)
  {
    criteria.equalClause.customerId=req.query.customerId;
  }
  const totalPost = await customerServices.getExplorePosts(criteria)//getBookingsWithJoins(criteria);

  const response = {
    totalPost:
      totalPost && totalPost.length && totalPost[0].count
        ? totalPost[0].count
        : 0,
    totalPosts: [],
  };

  if (response.totalPost) {
    criteria.columns = `post.* `;
    criteria.type=req.query.type;
    criteria.limit = parseInt(req.query.limit) || 20;
    criteria.skip = parseInt(req.query.skip) || 0;

    response.totalPosts = await customerServices.getExplorePosts(//getBookingsWithJoins(
      criteria
    );
  }

  return responses.sendCustomSuccessResponse(res, language, response);
} catch (error) {
  loggs.logError("ERROR_GET_ALL_ORDERS", error);
  return responses.sendCustomErrorResponse(
    res,
    language,
    constants.responseCodes.COMMON_ERROR_CODE,
    constants.commonResponseMessages.SOMETHING_WENT_WRONG,
    {}
  );
}
}

async function getProfile(req, res) {
  try {
    var language = req.headers["content-language"] || constants.defaultLanguage;
    req.customerDetails.accessToken = req.body["access-token"];

    // loggs.log("DATA_JUST_BEFORE-->", req.enterpriceDetails);

    const customer = await customerServices.getCustomer({
      equalClause: {
        customerId:req.query.customerId,
        followCheck:req.customerDetails.customerId
      },
    });
    if(!customer && !customer.length)
    {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.CUSTOMER_ID_REQUIRED
      );

    }

    return responses.sendCustomSuccessResponse(
      res,
      language,
      customer || {}
    );
  } catch (error) {
    loggs.logError("GET_MY_PROFILE", error);
    return responses.sendCustomErrorResponse(res, language);
  }
}
async function getSearchHints(req, res) {
  try {
    var language = req.headers["content-language"] || constants.defaultLanguage;
    req.customerDetails.accessToken = req.body["access-token"];

    // loggs.log("DATA_JUST_BEFORE-->", req.enterpriceDetails);

    const customer = await customerServices.getCustomer({
      search:req.query.search,
      columns: "tb_customers.customerId,tb_customers.firstName,tb_customers.lastName,tb_customers.profilePicUrl"
    });
    if(!customer && !customer.length)
    {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.CUSTOMER_ID_REQUIRED
      );

    }

    return responses.sendCustomSuccessResponse(
      res,
      language,
      customer || {}
    );
  } catch (error) {
    loggs.logError("GET_MY_PROFILE", error);
    return responses.sendCustomErrorResponse(res, language);
  }
}


module.exports = {
  registerCustomer,
  verifyOtpForForgotPassword,
  changePassword,
  customerForgotPassword,
  getMyProfile,
  customerLogout,
  verifyOtp,
  customerLogin,
  updateCustomer,
  createPost,
  resendOtp,
  likePost,
  follow,
  getPost,
  getExplorePost,
  getProfile,
  getSearchHints
};
