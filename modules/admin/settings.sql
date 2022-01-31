 create table tb_admins(
     adminId int(25) PRIMARY KEY auto_increment,
     name          varchar(40),              
     email          varchar(40),              
    password       varchar(100),           
    isSupperAdmin  boolean DEFAULT 0   ,         
    isBlocked      boolean DEFAULT 0,           
    createdAt      timestamp  DEFAULT CURRENT_TIMESTAMP,
    updatedAt      timestamp   DEFAULT CURRENT_TIMESTAMP, 
    countryCode    varchar(5),            
    phoneNo        varchar(14)
 );
 


create  table tb_enterprice_settings(
id bigint auto_increment primary key ,
 adminId bigint ,
 enterpriceReferenceId varchar(200)  , 
 adnroidGoogleMapKey mediumtext DEFAULT NULL ,
 iosGoogleMapKey mediumtext DEFAULT NULL, 
 logoImage mediumtext DEFAULT NULL,
 favIcon mediumtext DEFAULT NULL,
 dashboardMapKey mediumtext DEFAULT NULL,
 customerWebMapKey mediumtext DEFAULT NULL,
 domainName mediumtext DEFAULT NULL , 
 branchMapkey mediumtext DEFAULT NULL
);

create table tb_customer_device_settings (
id bigint auto_increment primary key ,
adminId bigint ,
deviceType varchar(50 ) DEFAULT NULL ,
pemFilePath varchar(150) DEFAULT NULL,
fcmKey mediumtext DEFAULT NULL ,
appVersion varchar(20) DEFAULT NULL ,
previousVersion varchar(20) DEFAULT NULL ,
forcePush tinyint default 0 ,
appLink VARCHAR(250) default null 
);


create table tb_branch_general_settings (
id bigint auto_increment primary key ,
domainName mediumtext default null ,
favIcon mediumtext default null ,
branchLogo mediumtext default null ,
multiSession tinyint default 0 ,
sessionExpiryIn int  default 3.6e+6 /* value in millseconds */
);



create table tb_customer_web_settings(
id bigint auto_increment primary key ,
adminId bigint ,
domainName varchar(300) default null ,
favIcon varchar(300) default null ,
logo varchar(300) default null ,
multiSession tinyint default 0 ,
sessionExpiryIn int  default 3.6e+6 /* value in millseconds */
);
