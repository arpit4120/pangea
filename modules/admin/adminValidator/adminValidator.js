const Joi = require("joi");
const constants = require("./../../../properties/constants");

const validator = require("./../../../services/validator");
const logg = require("./../../../services/logging");
const { join } = require("bluebird");

function registerAdmin(req, res, next) {
  logg.log("ADDING_USER=>", { BODY: req.body, HEADER: req.headers });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["content-language"] = req.headers["content-language"];
  let schemaObject = {
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    phoneNo: Joi.string().required(),
    countryCode: Joi.string().required(),
    "content-language": Joi.string().required(),
    isSupperAdmin: Joi.string().optional(),
    isBlocked: Joi.boolean().optional(),
  };
  const schema = Joi.object().keys(schemaObject);

  let validate = validator.validateRequest(req.body, schema, res, language);
  console.log("hh", validate);

  if (validate) {
    next();
  }
}

function adminLogin(req, res, next) {
  const language = req.headers["content-language"] || constants.defaultLanguage;
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    enterpriceReferenceId: Joi.string().required(),
    //timezone: Joi.number().required()
  });

  const validate = validator.validateRequest(req.body, schema, res, language);
  console.log("validate", validate);

  if (validate) {
    return next();
  }
}
function updateAdminDetails(req, res, next) {
  logg.log("UPDATING_ADMIN_DETAILS=>", { BODY: req.body, HEADER: req.headers });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = req.headers["content-language"];
  let schemaObject = {
    adminId: Joi.number().required(),
    "access-token": Joi.string().required(),
    password: Joi.string().optional(),
    name: Joi.string().optional(),
    email: Joi.string().optional(),
    phoneNo: Joi.string().optional(),
    isSupperAdmin: Joi.string().optional(),
    isBlocked: Joi.boolean().optional(),
    countryCode: Joi.string().optional(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    next();
  }
}
function getAllCustomers(req, res, next) {
  // console.log("path==>", req.path);
  logg.log("VALIDATING ADMIN TO GET LIST-OF-CUSTOMER=>", {
    BODY: req.query,
    HEADER: req.headers,
  });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.query["access-token"] = req.headers["access-token"];
  req.query["content-language"] = req.headers["content-language"];

  let schemaObject = {
    limit: Joi.number().optional().default(20),
    skip: Joi.number().optional().default(0),
    currentPage: Joi.number().default(1),
    search: Joi.string().optional(),
    ["access-token"]: Joi.string().required(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);

  validate = validator.validateRequest(req.query, schema, res, language);
  if (validate) {
    next();
  }
}
function getCustomerDetails(req, res, next) {
  // console.log("path==>", req.path);
  logg.log("GETTING_CUST=>", { BODY: req.query, HEADER: req.headers });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.query["access-token"] = req.headers["access-token"];
  req.query["content-language"] = req.headers["content-language"];
  let schemaObject = {
    customerId: Joi.number().required(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    ["access-token"]: Joi.string().required(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.query, schema, res, language);
  if (validate) {
    next();
  }
}

function deleteCustomer(req, res, next) {
  logg.log("DELETE_CUSTOMER=>", { BODY: req.body, HEADER: req.headers });
  req.body["customerId"] = parseInt(req.query.customerId);
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    customerId: Joi.number().required(),
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);
  console.log("validateing", validate, req.body);

  if (validate) {
    next();
  }
}
function blockCustomer(req, res, next) {
  logg.log("BLOCKING CUSTOMRT=>", { BODY: req.body, HEADER: req.headers });
  // req.body["customerId"]=parseInt(req.query.customerId)
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    customerId: Joi.number().required(),
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);
  if (validate) {
    next();
  }
}

function unblockCustomer(req, res, next) {
  logg.log("UNBLOCKING CUSTOMRT=>", { BODY: req.body, HEADER: req.headers });
  // req.body["customerId"]=parseInt(req.query.customerId)
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    customerId: Joi.number().required(),
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);
  if (validate) {
    next();
  }
}

function customerPost(req, res, next) {
  logg.log("UNBLOCKING CUSTOMRT=>", { BODY: req.body, HEADER: req.headers });
  // req.body["customerId"]=parseInt(req.query.customerId)
  const language = req.headers["content-language"] || constants.defaultLanguage;
  req.body["access-token"] = req.headers["access-token"];
  req.body["content-language"] = language;
  let schemaObject = {
    customerId: Joi.number().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref("startDate")).optional(),
    "access-token": Joi.string().required(),
    "content-language": Joi.string().required(),
  };
  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);
  if (validate) {
    next();
  }
}

function saveImages(req, res, next) {
  logg.log("SAVE_IMAGES=>", {
    BODY: req.body,
    HEADER: req.headers,
  });

  const language = req.headers["content-language"] || constants.defaultLanguage;

  req.body["content-language"] = language;
  req.body["access-token"] = req.headers["access-token"];
  let schemaObject = {
    "content-language": Joi.string().required(),
    branchId: Joi.string().required(),
    "access-token": Joi.string().required(),
    description: Joi.string().optional(),
  };

  const schema = Joi.object().keys(schemaObject);
  validate = validator.validateRequest(req.body, schema, res, language);

  if (validate) {
    req.body.saveRecord = 1;
    next();
  }
}

module.exports = {
  customerPost,
  unblockCustomer,
  blockCustomer,
  deleteCustomer,
  getCustomerDetails,
  getAllCustomers,
  updateAdminDetails,
  adminLogin,
  registerAdmin
};
