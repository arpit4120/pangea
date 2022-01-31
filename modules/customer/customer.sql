CREATE TABLE "tb_customers" (
  "customerId" bigint(20) NOT NULL AUTO_INCREMENT,
  "firstName" varchar(20) DEFAULT NULL,
  "phoneNo" varchar(15) DEFAULT NULL,
  "lastName" varchar(40) DEFAULT NULL,
  "countryCode" varchar(5) DEFAULT NULL,
  "email" varchar(40) DEFAULT NULL,
  "password" varchar(110) DEFAULT NULL,
  "accessToken" varchar(100) DEFAULT NULL,
  "socialId" int(30) DEFAULT NULL,
  "socialMode" varchar(20) DEFAULT NULL,
  "profilePicURL" varchar(200) DEFAULT NULL,
  "passwordResetToken" varchar(100) DEFAULT NULL,
  "OTPCode" varchar(40) DEFAULT NULL,
  "phoneVerified" tinyint(1) DEFAULT '0',
  "isBlocked" tinyint(1) DEFAULT '0',
  "isDeleted" tinyint(1) DEFAULT '0',
  "gender" tinyint(1) DEFAULT '0',
  "dateOfBirth" DATETIME 
  PRIMARY KEY ("customerId")
);

CREATE TABLE `tb_posts` (
  `postId` bigint(20) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `description` text DEFAULT NULL,
  `photoUrl` varchar(15) DEFAULT NULL,
  `userName` varchar(40) DEFAULT NULL,
  `totalLikes` bigint(20) DEFAULT 0,
  'createdAt' DATETIME
);

CREATE TABLE `tb_follows` (
  `followId` bigint(20) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `followcustomerId`  bigint(20)  DEFAULT NULL,
  `customerId` bigint(20)  DEFAULT NULL
);

CREATE TABLE `tb_post_likes` (
  `postLikeId` bigint(20) NOT NULL PRIMARY KEY  AUTO_INCREMENT,
  `postId` bigint(20) NOT NULL ,
  `customerId` bigint(20) NOT NULL
);


CREATE TABLE `tb_admins` (
  `adminId` bigint(20) NOT NULL  PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(20) DEFAULT NULL,
  `phoneNo` varchar(15) DEFAULT NULL,
  `countryCode` varchar(5) DEFAULT NULL,
  `email` varchar(40) DEFAULT NULL,
  `password` varchar(110) DEFAULT NULL,
  `accessToken` varchar(100) DEFAULT NULL,
  `isBlocked` tinyint(1) DEFAULT '0',
  `isDeleted` tinyint(1) DEFAULT '0'
);

CREATE TABLE `tb_languages` (
  `languageId` bigint(20) NOT NULL PRIMARY KEY  AUTO_INCREMENT,
  `language` varchar(20);
);








