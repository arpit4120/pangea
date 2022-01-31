const express = require("express");
const multipart = require("connect-multiparty");
//const multipartMiddleware = multipart();

const router = express.Router();
const adminValidators = require("./adminValidator/adminValidator");
const adminControllers = require("./adminController/adminControllers");
const sessionManagment = require("./../../services/sessionManagement");
const customersController = require("./../customer/custController/custController");
const customerValidator = require("./../customer/custValidator/custValidator");


router.post(
  "/registerAdmin",
  adminValidators.registerAdmin,
  adminControllers.registerAdmin
);

router.post(
  "/login",
  adminValidators.adminLogin,
  sessionManagment.authenticateEnterprice,
  adminControllers.adminLogin
);

router.put(
  "/updateAdminDetails",
  adminValidators.updateAdminDetails,
  sessionManagment.authenticateAccessToken,
  adminControllers.updateAdminDetails
);

router.get(
  "/getAllCustomers",
  adminValidators.getAllCustomers,
  sessionManagment.authenticateAccessToken,
  adminControllers.getAllCustomers
);

router.get(
  "/getCustomerDetails",
  adminValidators.getCustomerDetails,
  sessionManagment.authenticateAccessToken,
  adminControllers.getCustomerDetails
);

router.delete(
  "/deleteCustomer",
  adminValidators.deleteCustomer,
  sessionManagment.authenticateAccessToken,
  adminControllers.deleteCustomer
);

router.put(
  "/blockCustomer",
  adminValidators.blockCustomer,
  sessionManagment.authenticateAccessToken,
  adminControllers.blockCustomer
);

router.put(
  "/unblockCustomer",
  adminValidators.unblockCustomer,
  sessionManagment.authenticateAccessToken,
  adminControllers.unblockCustomer
);

router.get(
  "/getCustomerPost",
  adminValidators.customerPost,
  sessionManagment.authenticateAccessToken,
  adminControllers.customerPost
)

router.put(
  "/updateCustomer",
  customerValidator.updateCustomer,
  sessionManagment.authenticateAccessToken,
  customersController.updateCustomer
);

module.exports = router;
