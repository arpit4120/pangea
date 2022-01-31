const express = require("express");
const router = express.Router();
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();

const sessionManagment = require("../../services/sessionManagement");
const customerController = require("./custController/custController");
const customerValidator = require("./custValidator/custValidator");
//const invetoryController = require("./../inventory/inventoryController/inventoryController");


router.post(
  "/register",
  customerValidator.registerCustomer,
  sessionManagment.authenticateEnterprice,
  customerController.registerCustomer
);

router.post(
  "/login",
  customerValidator.customerLogin,
  sessionManagment.authenticateEnterprice,
  customerController.customerLogin
);

router.put(
  "/updateProfile",
  customerValidator.updateCustomer,
  multipartMiddleware,
  sessionManagment.authenticateAccessToken,
  customerController.updateCustomer
);
router.post(
  "/logout",
  customerValidator.customerLogout,
  sessionManagment.authenticateAccessToken,
  customerController.customerLogout
);

router.get(
  "/getMyProfile",
  customerValidator.getMyProfile,
  sessionManagment.authenticateAccessToken,
  customerController.getMyProfile
);

router.put(
  "/verifyOtp",
  customerValidator.verifyOtp,
  sessionManagment.authenticateAccessToken,
  customerController.verifyOtp
);

router.put(
  "/resendOtp",
  customerValidator.resendOtp,
  sessionManagment.authenticateAccessToken,
  customerController.resendOtp
);

router.put(
  "/customerForgotPassword",
  customerValidator.customerForgotPassword,
  sessionManagment.authenticateEnterprice,
  customerController.customerForgotPassword
);

router.post(
  "/changePassword",
  customerValidator.changePassword,
  sessionManagment.authenticateAccessToken,
  customerController.changePassword
);

router.put(
  "/verifyTokenForForgotPassword",
  customerValidator.verifyOtpForForgotPassword,
  customerController.verifyOtpForForgotPassword
);


router.post(
  "/createNewPost",
  customerValidator.createPost,
  sessionManagment.authenticateAccessToken,
  customerController.createPost
  )

router.put(
  "/likeUnlikePost",
  customerValidator.likePost,
  sessionManagment.authenticateAccessToken,
  customerController.likePost
)

router.put(
  "/followUnfollow",
  customerValidator.follow,
  sessionManagment.authenticateAccessToken,
  customerController.follow
)

router.get(
  "/getPost",
  customerValidator.getPost,
  sessionManagment.authenticateAccessToken,
  customerController.getPost
)

router.get(
  "/getExplorePost",
  customerValidator.getExplorePost,
  sessionManagment.authenticateAccessToken,
  customerController.getExplorePost
)

router.get(
  "/getUpdatesPost",
  customerValidator.getExplorePost,
  sessionManagment.authenticateAccessToken,
  customerController.getExplorePost
)

// router.get(
//   "/getSearchHints",
//   customerValidator.getSearchHints,
//   sessionManagment.authenticateAccessToken,
//   customerController.getSearchHints
// )

// router.get(
//   "/getSearchResults",
//   customerValidator.getSearchResults,
//   sessionManagment.authenticateAccessToken,
//   customerController.getSearchResults
// )

module.exports = router;
