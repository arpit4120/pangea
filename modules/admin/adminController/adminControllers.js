const MD5 = require("md5");

const path = require("path");
const fs = require("fs");
const es = require("event-stream");
const Promise = require("bluebird");
const moment = require("moment");

const loggs = require("../../../services/logging");
const responses = require("../../../services/responses");
const constants = require("../../../properties/constants");
const adminServices = require("../adminServices/adminServices");
const universalFunctions = require("../../../services/universanFucntions");
const sessionManager = require("../../../services/sessionManagement");
const mysqlService = require("../../../databases/mysql/mysql");
const customerServices = require("../../customer/custServices/custServices");
//const invetoryService = require("../../inventory/inventoryServices/inventoryService");
// const notificationService = require("../../../services/notficationService");
// const { userTypes } = require("../../../properties/constants");
// const { constant } = require("lodash");
// const imageThumbnail = require("image-thumbnail");
const { response } = require("express");

async function registerAdmin(req, res) {
  const language = req.headers["content-language"];
  try {
    const authenticatedAdminEmail = await adminServices.authenticateEmail({
      email: req.body.email,
    });
    if (authenticatedAdminEmail && authenticatedAdminEmail.length) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.DUPLICATE_EMAIL_EXISTS
      );
    }
    req.body.password = await universalFunctions.encryptPassword(
      req.body.password
    );

    req.body.language = language;
    var transactionConnection = await mysqlService.getConnectionPromisified();

    await mysqlService.startTransactionPromisified(transactionConnection);

    const insertedAdmin = await adminServices.insertAdmin(
      req.body,
      transactionConnection
    );

    if (insertedAdmin.insertId) {
      await mysqlService.commitTransactionPromisified(transactionConnection);
      return responses.sendCustomSuccessResponse(
        res,
        language,
        {
          adminId: insertedAdmin.insertId,
        },
        constants.responseCodes.SUCCESS,
        constants.commonResponseMessages.SUCCESS
      );
    } else {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.ACTION_FAILED,
        insertedAdmin
      );
    }
  } catch (error) {
    loggs.logError("error_while_admin_registration", error);
    if (transactionConnection) {
      await mysqlService.rollbackTransactionPromisified(transactionConnection);
    }
    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.SOMETHING_WENT_WRONG,
      constants.commonResponseMessages.SOMETHING_WENT_WRONG,
      {}
    );
  }
}
async function updateAdminDetails(req, res) {
  const language = req.headers["content-language"];
  try {
    if (req.body.email) {
      let obj = {
        email: req.body.email,
        notEqualClause: {
          adminId: req.body.adminId,
        },
      };
      console.log(obj);
      const authenticatedAdminEmail = await adminServices.authenticateEmail(
        obj
      );
      if (authenticatedAdminEmail && authenticatedAdminEmail.length) {
        return responses.sendCustomErrorResponse(
          res,
          language,
          constants.responseCodes.COMMON_ERROR_CODE,
          constants.commonResponseMessages.DUPLICATE_EMAIL_EXISTS
        );
      }
    }
    if (req.body.password) {
      req.body.password = await universalFunctions.encryptPassword(
        req.body.password
      );
    }
    const updatedResult = await adminServices.updateAdminDetails(req.body);
    if (updatedResult.affectedRows) {
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
    loggs.logError("error_while_updating_admin_details", error);
    return responses.sendCustomErrorResponse(res, language);
  }
}
async function adminLogin(req, res) { 
  loggs.log("REQ_BODY_IN_ADMIN_LOGIN", {
    BODY: req.body,
    HEADERS: req.headers,
  });
  const language = req.headers["content-language"] || constants.defaultLanguage;
  try {

    let adminDetails = [];

    adminDetails = await adminServices.authenticateEmailWithEnterpriceId({
      email: req.body.email,
      enterpriceReferenceId: req.body.enterpriceReferenceId,
    });
    loggs.log("ADMIN_DETAILS=>", adminDetails);
    if(!adminDetails)
    {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.INCORRECT_PASSWORD
      );
    }
    console.log(adminDetails);

    if (
      adminDetails[0].adminId != req.enterpriceDetails.adminId &&
      adminDetails[0].isBlocked
    ) {
      return responses.sendCustomErrorResponse(
        res,
        req.headers["content-language"],
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.SUBADMIN_BLOCKED
      );
    }

    const checkedPassword = await universalFunctions.checkPassword(
      req.body.password,
      adminDetails[0].password
    );
    if (!checkedPassword) {
      return responses.sendCustomErrorResponse(
        res,
        language,
        constants.responseCodes.COMMON_ERROR_CODE,
        constants.commonResponseMessages.INCORRECT_PASSWORD
      );
    }
    const tokenData = {
      adminId: adminDetails[0].adminId,
      email: adminDetails[0].email,
      userType: constants.userTypes.ADMIN,
      enterpriceReferenceId: req.enterpriceDetails.enterpriceReferenceId,
    };

    adminDetails[0]["access-token"] = await sessionManager.createAccessToken(
      tokenData
    );
    
    console.log(adminDetails[0]);

    delete adminDetails[0].password;

    await adminServices.updateAdminDetails({
      adminId: adminDetails[0].adminId,
      language: language,
    });

    return responses.sendCustomSuccessResponse(res, language, adminDetails[0]);
  } catch (error) {
    loggs.logError("error_while_admin_login", error);
    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      constants.commonResponseMessages.LOGIN_FAILURE
    );
  }
}
async function getAllCustomers(req, res) {
  loggs.log("STARTED FETCHING LIST-OF-CUSTOMER", {
    headers: req.headers,
  });
  const language = req.headers["content-language"];
  try {
    let searches = [];
    if (req.query.search) {
      searches = req.query.search.split(" ");
    }

    const opts = {
      columns: "COUNT(*) count ",
      adminId: req.enterpriceDetails.adminId,
      // search: req.query.search ,
      searches: searches,
    };

    const count = await customerServices.getCustomer(opts);
    const response = {
      countOfCustomers:
        count && count.length && count[0].count ? count[0].count : 0,
      customersData: [],
    };
    loggs.log("COUNT-OF-CUSTOMERS IS ", count);
    if (!response.countOfCustomers) {
      return responses.sendCustomSuccessResponse(res, language, {});
    }
    delete opts.columns;
    opts.limit = parseInt(req.query.limit) || 20;
    opts.skip = parseInt(req.query.skip) || 0;
    response.customersData = await customerServices.getCustomer(opts);
    return responses.sendCustomSuccessResponse(res, language, response);
  } catch (error) {
    loggs.logError("error_while_getting_cust_list", error);
    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      constants.commonResponseMessages.SOMETHING_WENT_WRONG,
      {}
    );
  }
}
async function getCustomerDetails(req, res, next) {
  loggs.log("FETECHING........CUSTOMER........PROFILE");
  var language = req.headers["content-language"];
  try {
    let customer = await customerServices.getCustomer({
      adminId: req.enterpriceDetails.adminId,
      equalClause: {
        customerId: req.query.customerId,
      }
    });

    if (!customer || !customer.length) {
      return responses.sendCustomSuccessResponse(res, language, {
        customerDetails: {
          totalPost: 0,
          totalPosts:[]
        },
      });
    }

    customer = customer[0];

    customer.totalPost= await customerServices.getPosts({
      columns: " COUNT (*) as count ",
      adminId: req.enterpriceDetails.adminId,
      equalClause: {
        customerId: req.query.customerId,
      },
    });

    customer.totalPost =
      customer.totalPost &&
      customer.totalPost.length &&
      customer.totalPost[0].count
        ? customer.totalPost[0].count
        : 0;

    if (customer.totalPost) {
      customer.totalPosts = await customerServices.getPosts({
        columns: `post.* `,
        adminId: req.enterpriceDetails.adminId,
        equalClause: {
          customerId: req.query.customerId,
        },
        limit: parseInt(req.query.limit) || 20,
        skip: parseInt(req.query.skip) || 0,
      });
    } else {
      customer.totalPosts = [];
    }

    return responses.sendCustomSuccessResponse(res, language, customer);
  } catch (error) {
    loggs.logError("error_while_getting_cust_details", error);
    return responses.sendCustomErrorResponse(res, language, {});
  }
}
async function deleteCustomer(req, res, next) {
  loggs.log("DELETING SELECTED CUSTOMER................");
  const language = req.headers["content-language"];
  const customerId = parseInt(req.query.customerId);
  try {
    response = await adminServices.deleteCustomer(customerId);
    return responses.sendCustomSuccessResponse(res, language, response);
  } catch (error) {
    loggs.logError("error_while_delete_cust_details", error);
    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      constants.commonResponseMessages.SOMETHING_WENT_WRONG,
      response
    );
  }
}
async function blockCustomer(req, res, next) {
  loggs.log("BLOCKING SELECTED CUSTOMER................");
  const language = req.headers["content-language"];
  const customerId = parseInt(req.body.customerId);
  try {
    /*todo* check for pending bookings */
    await customerServices.updateCustomer(
      {
        isBlocked: 1,
      },
      customerId
    );
    return responses.sendCustomSuccessResponse(res, language, {});
  } catch (error) {
    loggs.logError("error_while_blocking_customer", error);
    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      constants.commonResponseMessages.SOMETHING_WENT_WRONG,
      {}
    );
  }
}
async function unblockCustomer(req, res, next) {
  loggs.log("UNBLOCKING SELECTED CUSTOMER................");
  const language = req.headers["content-language"];
  const customerId = parseInt(req.body.customerId);
  try {
    let response = await customerServices.updateCustomer(
      {
        isBlocked: 0,
      },
      customerId
    );
    return responses.sendCustomSuccessResponse(res, language, {});
  } catch (error) {
    loggs.logError("error_while_unblocking_customer", error);
    return responses.sendCustomErrorResponse(
      res,
      language,
      constants.responseCodes.COMMON_ERROR_CODE,
      constants.commonResponseMessages.SOMETHING_WENT_WRONG,
      {}
    );
  }
}
async function customerPost(req, res) {
    var language = req.headers["content-language"];

    try {

    let criteria = {
      equalClause: {
      },
      inClause: {},
      greaterAndEqual: {
        createdAt: universalFunctions.convertTimeIntoLocal(
          new Date(req.query.startDate),
          req.timezone
        ),
      },
      lessThanEqual: {
        createdAt: universalFunctions.convertTimeIntoLocal(
          new Date(req.query.endDate),
          req.timezone
        ),
      }
    };
    if(req.query.customerId)
    {
      criteria.equalClause.customerId=req.customerId.query;
    }

    loggs.log("CRITERIA==>", criteria);
    criteria.columns = " COUNT (DISTINCT post.postId ) AS count ";
    const totalPost = await customerServices.getPosts(criteria)//getBookingsWithJoins(criteria);

    const response = {
      totalPost:
        totalPost && totalPost.length && totalPost[0].count
          ? totalPost[0].count
          : 0,
      totalPosts: [],
    };

    if (response.totalPost) {
      criteria.columns = `post.* `;

      criteria.limit = parseInt(req.query.limit) || 20;
      criteria.skip = parseInt(req.query.skip) || 0;

      response.totalPosts = await customerServices.getPosts(//getBookingsWithJoins(
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
// async function uploadImage(req, res) {
//   try {
//     const language =
//       req.headers["content-language"] || constants.defaultLanguage;
//     loggs.log("UPLOAD_IMAGE=>", req.files);
//     console.log(req.files);

//     let options = { width: 200, height: 200 };

//     if (req.files && req.files.file.size && req.files.file.size > 5000000)
//       //check file size to be 5 mb
//       return responses.sendCustomErrorResponse(
//         res,
//         language,
//         constants.responseCodes.COMMON_ERROR_CODE,
//         constants.commonResponseMessages.FILE_SIZE_EXCEEDS
//       );

//     const thumbnail = await imageThumbnail(req.files.file.path, options);
//     console.log(thumbnail);
//     req.files.file.thumbnail = thumbnail;
//     console.log(req.files.file);
//     const s3ImageData = await universalFunctions.uploadS3Image(req.files); // upload image
//     console.log(s3ImageData);

//     delete req.files.file.thumbnail;

//     const s3ImageData2 = await universalFunctions.uploadS3Image(req.files); // upload image
//     console.log(s3ImageData2);
//     console.log("fun");
//     if (!s3ImageData && !s3ImageData2) {
//       // checks upload response
//       console.log("got s3ImageData");
//       return responses.sendCustomErrorResponse(
//         res,
//         language,
//         constants.responseCodes.COMMON_ERROR_CODE,
//         constants.commonResponseMessages.FAILED_TO_UPLOAD_IMAGE
//       );
//     }
//     const imageUrl = `${config.get("s3Config.S3URL")}${config.get(
//       "s3Config.folders.IMAGES"
//     )}/${s3ImageData}`; //generate image url
//     const imageUrl2 = `${config.get("s3Config.S3URL")}${config.get(
//       "s3Config.folders.IMAGES"
//     )}/${s3ImageData2}`; //generate image url

//     loggs.log("IMAGE_URK=>", { URL: imageUrl });
//     return responses.sendCustomSuccessResponse(res, language, {
//       image: imageUrl2,
//       thumbnail: imageUrl,
//     });
//   } catch (error) {
//     loggs.logError("error_while_uploading_image", error);
//     return responses.sendCustomErrorResponse(res);
//   }
// }

// async function uploadImage(req, res) {
//   try {
//     const language =
//       req.headers["content-language"] || constants.defaultLanguage;
//     loggs.log("UPLOAD_IMAGE=>", req.files);
//     console.log(req.files);

//     let options = { width: 200, height: 200 };
//     if (req.files && req.files.file.size && req.files.file.size > 5000000)
//       //check file size to be 5 mb
//       return responses.sendCustomErrorResponse(
//         res,
//         language,
//         constants.responseCodes.COMMON_ERROR_CODE,
//         constants.commonResponseMessages.FILE_SIZE_EXCEEDS
//       );

//     let thumbnail, s3ImageData;

//     loggs.log("FILE_TYPE==>", req.files.file.type);
//     if (req.files.file.type != "image/vnd.microsoft.icon") {
//       loggs.log("FILE_TYPE_CHECK=>");
//       thumbnail = await imageThumbnail(req.files.file.path, options);
//       console.log(thumbnail);
//       req.files.file.thumbnail = thumbnail;
//       console.log(req.files.file);

//       s3ImageData = await universalFunctions.uploadS3Image(req.files); // upload image
//       loggs.log("s3_image_Data-->", s3ImageData);

//       delete req.files.file.thumbnail;
//     }

//     const s3ImageData2 = await universalFunctions.uploadS3Image(req.files); // upload image
//     console.log(s3ImageData2);
//     console.log("fun");
//     if (!s3ImageData && !s3ImageData2) {
//       // checks upload response
//       console.log("got s3ImageData");
//       return responses.sendCustomErrorResponse(
//         res,
//         language,
//         constants.responseCodes.COMMON_ERROR_CODE,
//         constants.commonResponseMessages.FAILED_TO_UPLOAD_IMAGE
//       );
//     }
//     let imageUrl = "";
//     loggs.log("s3ImageData===>", s3ImageData);
//     if (thumbnail) {
//       imageUrl = `${config.get("s3Config.S3URL")}${config.get(
//         "s3Config.folders.IMAGES"
//       )}/${s3ImageData}`; //generate image url
//     }

//     const imageUrl2 = `${config.get("s3Config.S3URL")}${config.get(
//       "s3Config.folders.IMAGES"
//     )}/${s3ImageData2}`; //generate image url

//     loggs.log("IMAGE_URK=>", { URL: imageUrl });

//     if (parseInt(req.body.saveRecord)) {
//       await adminServices
//         .saveImageRecords({
//           imageUrl: imageUrl2,
//           imageIcon: imageUrl,
//           description: req.body.description,
//           adminId: req.enterpriceDetails.adminId,
//           branchId: req.body.branchId,
//           fileName: s3ImageData2,
//         })
//         .then(() => {})
//         .catch((error) => {
//           loggs.log("ERROR_WHILE_SAVING_IMAGE=>", error);
//         });
//     }

//     return responses.sendCustomSuccessResponse(res, language, {
//       image: imageUrl2,
//       thumbnail: imageUrl,
//     });
//   } catch (error) {
//     loggs.logError("error_while_uploading_image", error);
//     return responses.sendCustomErrorResponse(res);
//   }
// }

// async function getSettingsViaDomain(req,res) {
//   try {
//     var language = req.headers["content-language"];

//     const settings = await adminServices.fetchSettingsViaDomain(req.query);

//     return responses.sendCustomSuccessResponse(res,language,(settings && settings.length)?settings[0] : {} ,
//       constants.responseCodes.SUCCESS,
//       constants.commonResponseMessages.SUCCESS);
//   } catch(error){
//     loggs.logError("GET_SETTINGS_VIA_DOMAIN", error);
//     return responses.sendCustomErrorResponse(res, language,
//       constants.responseCodes.SOMETHING_WENT_WRONG,
//       constants.commonResponseMessages.SOMETHING_WENT_WRONG);
//   }
// };


module.exports = {
  registerAdmin,
  updateAdminDetails,
  adminLogin,
  getAllCustomers,
  getCustomerDetails,
  deleteCustomer,
  blockCustomer,
  unblockCustomer,
  customerPost
};
