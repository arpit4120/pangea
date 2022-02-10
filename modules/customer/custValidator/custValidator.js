const Joi = require("joi");
const constants = require("./../../../properties/constants");

const validator = require("./../../../services/validator");
const logg = require("./../../../services/logging");

function registerCustomer(req, res, next) {
  logg.log("ADDING_CUSTOMER=>", {
    BODY: req.body,
    HEADER: req.headers,
  });

  req.body["content-language"] =
    req.headers["content-language"] || constants.defaultLanguage;
  const language = req.body["content-language"];
  console.log("req.body", req.body);
  let schemaObject = {
    firstName: Joi.string().trim().min(2).optional(),
    lastName: Joi.string().trim().min(2).optional(),
    phoneNo: Joi.string()
      .min(7) //5->7
      .optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional().min(6).trim(),
    socialId: Joi.string().optional().trim(),
    socialMode: Joi.string()
      .valid(
        constants.SOCIAL_TYPE.FACEBOOK,
        constants.SOCIAL_TYPE.GOOGLE_PLUS,
        constants.SOCIAL_TYPE.TWITTER,
        constants.SOCIAL_TYPE.INSTAGRAM,
        constants.SOCIAL_TYPE.APPLE
      )
      .optional(),
    countryCode: Joi.string().optional().trim(),
    dateOfBirth: Joi.string().optional(),
    gender: Joi.string().valid(constants.gender.MALE, constants.gender.FEMALE),
    "content-language": Joi.string().required(),
    profilePicUrl: Joi.string().optional(),
    timezone: Joi.number().optional(),
    userName:Joi.string().optional(),
    transactionId:Joi.string().optional(),
    enterpriceReferenceId: Joi.string().required(),
  };

  const schema = Joi.object().keys(schemaObject);

  let validate = validator.validateRequest(req.body, schema, res, language);
  console.log("validator", validate);
  if (validate) {
    req.body.fromCustomer = true;
    next();
  }
}
function customerLogin(req, res, next) {
  logg.log("CUSTOMER_LOGIN=>", req.body);
  const language = req.headers["content-language"] || constants.defaultLanguage;
  const schema = Joi.object().keys({
    email: Joi.string().optional(),
    phoneNo: Joi.string().optional(),
    password: Joi.string().optional().min(5).trim(),
    socialId: Joi.string().optional(),
    socialMode: Joi.string().optional(),
    enterpriceReferenceId: Joi.string().required(),
    countryCode: Joi.string().optional(),
  });

  const validate = validator.validateRequest(req.body, schema, res, language);
  console.log("validate", validate);

  if (validate) {
    return next();
  }
}
function updateCustomer(req, res, next) {
  logg.log("EDITING_CUSTOMER=>", {
    BODY: req.body || req.query,
    QUERY: req.customerId,
    HEADER: req.headers,
  });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    customerId: Joi.number().optional(),
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().optional(),
    phoneNo: Joi.string().optional(),
    countryCode: Joi.string().optional(),
    profilePic: Joi.any().optional().allow("").description("Image file "),
    password: Joi.string().optional(),
    isDeleted: Joi.number().optional(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);
  console.log("validateing", validate);

  if (validate) {
    next();
  }
}
function customerLogout(req, res, next) {
  logg.log("CUSTOMER_LOGOUT=>", {
    BODY: req.body,
    HEADER: req.headers,
  });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);
  console.log("validateing", validate);

  if (validate) {
    next();
  }
}
function getMyProfile(req, res, next) {
  logg.log("GET_MY_PROFILE=>", {
    BODY: req.body,
    HEADER: req.headers,
  });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);
  console.log("validateing", validate);

  if (validate) {
    next();
  }
}
function verifyOtp(req, res, next) {
  logg.log("VERIFY_OTP=>", {
    BODY: req.query,
    HEADER: req.headers,
  });

  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
    otpCode: Joi.string().optional(),
    //verifiedViaFirebase: Joi.number().optional(),
    //firebaseUID: Joi.string().optional(),
    email: Joi.string().optional(),
    //countryCode: Joi.string().optional(),
    //sessionId: Joi.number().optional(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    next();
  }
}
function resendOtp(req, res, next) {
  logg.log("RESEND_OTP=>", {
    BODY: req.query,
    HEADER: req.headers,
  });

  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    next();
  }
}
function customerForgotPassword(req, res, next) {
  logg.log("CUSTOMER_FROGOT_PASSWORD=>", {
    BODY: req.query,
    HEADER: req.headers,
  });

  const language = req.headers["content-language"] || constants.defaultLanguage;

  req.body["content-language"] = language;
  let schemaObject = {
    "content-language": Joi.string().required(),
    //countryCode: Joi.string().required(),
    emailId: Joi.string().required(),
    //enterpriceReferenceId: Joi.string().required(),
  };

  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    next();
  }
}
function changePassword(req, res, next) {
  logg.log("CHANGE_PASSWORD=>", {
    BODY: req.query,
    HEADER: req.headers,
  });

  const language = req.headers["content-language"] || constants.defaultLanguage;

  req.body["content-language"] = language;
  req.body["access-token"] = req.headers["access-token"];
  let schemaObject = {
    "content-language": Joi.string().required(),
    "access-token": Joi.string().required(),
    oldPassword: Joi.string().required().min(5).trim(),
    newPassword: Joi.string().required().min(5).trim(),
  };

  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    next();
  }
}
function verifyOtpForForgotPassword(req, res, next) {
  logg.log("CHANGE_PASSWORD=>", {
    BODY: req.query,
    HEADER: req.headers,
  });

  const language = req.headers["content-language"] || constants.defaultLanguage;

  let schemaObject = {
    password: Joi.string().required(),
    passwordResetToken: Joi.string().required(),
    enterpriceReferenceId: Joi.string().required(),
    language: Joi.string().optional(),
  };

  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    req.body.userType = constants.userTypes.CUSTOMER;
    next();
  }
}
function createPost(req, res, next) {
  logg.log("CHANGE_PASSWORD=>", {
    BODY: req.query,
    HEADER: req.headers,
  });

  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    customerId:Joi.number().optional(),
    photoUrl:Joi.string().optional(),
    description:Joi.string().optional(),
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };

  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    req.body.userType = constants.userTypes.CUSTOMER;
    next();
  }
}
function likePost(req, res, next) {
  logg.log("CHANGE_PASSWORD=>", {
    BODY: req.query,
    HEADER: req.headers,
  });

  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    customerId:Joi.number().optional(),
    postId:Joi.number().optional(),
    like:Joi.number().optional(),
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };

  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    req.body.userType = constants.userTypes.CUSTOMER;
    next();
  }
}
function follow(req, res, next) {
  logg.log("CHANGE_PASSWORD=>", {
    BODY: req.query,
    HEADER: req.headers,
  });

  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    customerId:Joi.number().optional(),
    //postId:Joi.string().optional(),
    follow:Joi.number().optional(),
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };

  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    req.body.userType = constants.userTypes.CUSTOMER;
    next();
  }
}
function getPost(req, res, next) {
  logg.log("GET_MY_PROFILE=>", {
    BODY: req.body,
    HEADER: req.headers,
  });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    type:Joi.number().optional(),
    customerId:Joi.number().optional(),
    limit:Joi.number().optional(),
    skip:Joi.number().optional(),
    "access-token": Joi.string().optional(),
    "content-language": Joi.string().optional(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.query, schema, res, language);
  console.log("validateing", validate);

  if (validate) {
    next();
  }
}

function getExplorePost(req, res, next) {
  logg.log("GET_MY_PROFILE=>", {
    BODY: req.body,
    HEADER: req.headers,
  });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    type:Joi.number().optional(),
    customerId:Joi.number().optional(),
    limit:Joi.number().optional(),
    skip:Joi.number().optional(),
    "access-token": Joi.string().optional(),
    "content-language": Joi.string().optional(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.query, schema, res, language);
  console.log("validateing", validate);

  if (validate) {
    next();
  }
}
function getProfile(req, res, next) {
  logg.log("GET_MY_PROFILE=>", {
    BODY: req.body,
    HEADER: req.headers,
  });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    "customerId":Joi.number().required(),
    "access-token": Joi.string().optional(),
    "content-language": Joi.string().optional(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.query, schema, res, language);
  console.log("validateing", validate);

  if (validate) {
    next();
  }
}

function getSearchHints(req, res, next) {
  logg.log("GET_MY_PROFILE=>", {
    BODY: req.body,
    HEADER: req.headers,
  });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    "search":Joi.string().required(),
    "access-token": Joi.string().optional(),
    "content-language": Joi.string().optional(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.query, schema, res, language);
  console.log("validateing", validate);

  if (validate) {
    next();
  }
}

module.exports = {
  registerCustomer,
  verifyOtpForForgotPassword,
  changePassword,
  customerForgotPassword,
  resendOtp,
  verifyOtp,
  getMyProfile,
  customerLogout,
  updateCustomer,
  customerLogin,
  createPost,
  likePost,
  follow,
  getPost,
  getExplorePost,
  getProfile,
  getSearchHints
};
