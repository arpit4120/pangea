const moment = require("moment");

const logg = require("./../../../services/logging");
const mysqlService = require("./../../../databases/mysql/mysql");
const constants = require("./../../../properties/constants");
const responses = require("../../../services/responses");


function authenticateEmail(obj) {
  try {
    let sql = `SELECT * FROM tb_admins WHERE adminId IS NOT NULL AND isDeleted!=1`;
    let params = [];
    if (obj.email) {
      sql += " AND email=?";
      params.push(obj.email);
    }
    if (obj.masterAdminId) {
      sql += " AND masterAdminId=?";
      params.push(obj.masterAdminId);
    }
    if (obj.notEqualClause) {
      if (obj.notEqualClause.adminId) {
        sql += " AND adminId!=?";
        params.push(obj.notEqualClause.adminId);
      }
    }
    return mysqlService.runMysqlQueryPromisified(
      "CHECKING FOR DUPLICATES",
      sql,
      params
    );
  } catch (err) {
    throw err;
  }
}

function authenticateLanguage(obj) {
  try {
    logg.log("obj language", obj);
    let sql = `SELECT * FROM tb_languages where language = ? `;
    let params = [];
    if (obj.language) {
      params.push(obj.language);
    }
    return mysqlService.runMysqlQueryPromisified(
      "CHECKING EXISTENCE",
      sql,
      params
    );
  } catch (err) {
    throw err;
  }
}

function insertAdmin(adminDetails, transactionConnection) {
  try {
    const obj = {};
    adminDetails.name ? (obj.name = adminDetails.name) : 0;
    adminDetails.email ? (obj.email = adminDetails.email) : 0;
    adminDetails.password ? (obj.password = adminDetails.password) : 0;
    adminDetails.phoneNo ? (obj.phoneNo = adminDetails.phoneNo) : 0;
    adminDetails.countryCode ? (obj.countryCode = adminDetails.countryCode) : 0;
    adminDetails.isSupperAdmin
      ? (obj.isSupperAdmin = adminDetails.isSupperAdmin)
      : 0;
    adminDetails.isBlocked ? (obj.isBlocked = adminDetails.isBlocked) : 0;

    const sql = "INSERT INTO tb_admins SET ?  ";
    return mysqlService.runMysqlQueryPromisified(
      "INSERTING_ADMIN",
      sql,
      [obj],
      transactionConnection
    );
  } catch (error) {}
}
function updateAdminDetails(adminDetails) {
  logg.log("ADMIN_DETAILS_BEFORE_UPDATE=>", adminDetails);
  return new Promise((resolve, reject) => {
    const obj = {};
    adminDetails.name ? (obj.name = adminDetails.name) : 0;
    adminDetails.email ? (obj.email = adminDetails.email) : 0;
    adminDetails.password ? (obj.password = adminDetails.password) : 0;
    adminDetails.countryCode ? (obj.countryCode = adminDetails.countryCode) : 0;
    adminDetails.isSupperAdmin
      ? (obj.isSupperAdmin = adminDetails.isSupperAdmin)
      : 0;
    adminDetails.isBlocked ? (obj.isBlocked = adminDetails.isBlocked) : 0;
    adminDetails.userType ? (obj.userType = adminDetails.userType) : 0;
    adminDetails.language ? (obj.language = adminDetails.language) : 0;
    let sql = "UPDATE tb_admins SET ? WHERE adminId =  ? ";
    const query = connection.query(
      sql,
      [obj, adminDetails.adminId],
      (error, result) => {
        logg.log("UPDATING_ADMIN>", {
          ERROR: error,
          RESULT: result,
          SQL: query.sql,
        });
        if (error) return reject(error);
        return resolve(result);
      }
    );
  });
}

function getAllCustomers(obj) {
  let perpage = obj.limit || 5;
  let currentPage = obj.currentPage || 1;
  let skip = perpage * (currentPage - 1);
  logg.log("FETECHING............CUSTOMERS", obj);
  return new Promise((resolve, reject) => {
    let sql = `SELECT * from tb_customer limit ${skip},${perpage} `;

    const query = connection.query(sql, (error, result) => {
      logg.log("GETTING_CUSTOMER=>", {
        ERROR: error,
        RESULT: result,
        SQL: query.sql,
      });

      if (error) return reject(error);
      if (result) {
        for (i = 0; i < result.length; i++) {
          delete result[i].password;
        }
        return resolve(result);
      }
    });
  });
}
async function getCustomerDetails(id) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * from tb_customers where customerId = ?`;

    const query = connection.query(sql, [id], (error, result) => {
      logg.log("GETTING_CUST=>", {
        ERROR: error,
        RESULT: result,
        SQL: query.sql,
      });
      if (error) return reject(error);
      return resolve(result);
    });
  });
}
async function deleteCustomer(customerId) {
  return new Promise((resolve, reject) => {
    let sql = `Delete from tb_customer where customerId=?`;

    const query = connection.query(sql, [customerId], (error, result) => {
      logg.log("DELETED_CUST=>", {
        ERROR: error,
        RESULT: "Deleted Successfully",
        SQL: query.sql,
      });
      if (error) return reject(error);
      return resolve(result);
    });
  });
}
async function blockCustomer(customerId) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE tb_customers SET IsBlocked=1 WHERE _id =  ?`;

    const query = connection.query(sql, [customerId], (error, result) => {
      logg.log("BLOCKING CUSTOMER=>", {
        ERROR: error,
        RESULT: "BLOCKED Successfully",
        SQL: query.sql,
      });
      if (error) return reject(error);
      return resolve(result);
    });
  });
}
async function unblockCustomer(customerId) {
  return new Promise((resolve, reject) => {
    let sql = `UPDATE tb_customer SET IsBlocked=0 WHERE _id =  ?`;

    const query = connection.query(sql, [customerId], (error, result) => {
      logg.log("BLOCKING CUSTOMER=>", {
        ERROR: error,
        RESULT: "BLOCKED Successfully",
        SQL: query.sql,
      });
      if (error) return reject(error);
      return resolve(result);
    });
  });
}

//getting customer orders
function getGroceryBooking(opts, transactionConnection) {
  try {
    logg.log("GET_GROCERY_BOOKING=>", opts);

    let joinSQL = ``;
    let joinSelectColumns = ` `;
    if (opts.joins) {
      if (opts.joins.address) {
        joinSelectColumns = `  ,  JSON_OBJECT('houseNumber' , address.houseNumber , 'streetName' , address.streetName , 'city' , address.city, 'phoneNo' , address.phoneNo , 'address' ,
        address.address , 'landMark' , address.landMark , 'pinCode' , address.pinCode , 'addressType' ,
         address.addressType , 'lattitude' , tb_bookings.deliveryLattitude , 'longitude' , tb_bookings.deliveryLongitude , 'otherText' , if(address.otherText IS NOT NULL , address.otherText , "")) AS address `;
        joinSQL = ` LEFT JOIN tb_booked_address  address On address.bookedAddressId = tb_bookings.bookedAddressId   `;
      }

      if (opts.joins.assignedPicker) {
        // joinSelectColumns += `  , IF(assingedPickers.pickerId IS not NULL ,
        //   CAST(
        //     CONCAT(
        //         '[',
        //         GROUP_CONCAT(
        //             JSON_OBJECT(
        //                      'pickerId' ,
        //                      picker.pickerId ,
        //                     'name' ,
        //                     picker.name
        //                 )
        //             ),
        //             ']'
        //         ) AS JSON
        //     ), JSON_ARRAY() )  as pickers  `
        joinSQL += ` INNER  JOIN tb_assigned_pickers assingedPickers 
           On assingedPickers.bookingId = tb_bookings.bookingId INNER JOIN tb_pickers picker ON 
           picker.pickerId = assingedPickers.pickerId AND picker.IsDelete = 0   `;
      }

      if (opts.joins.customer) {
        joinSelectColumns += ` ,
        IF(cust.customerId , JSON_OBJECT(
          'customerId' ,
              cust.customerId ,
              'customerName' ,
              cust.firstName ,
              'phoneNo' ,
              cust.phoneNo ,
              'email' ,
              cust.email ,
              'firstName'  ,
              cust.firstName , 
              'lastName' ,
              cust.lastName 
      ),JSON_object()) as customer  `;
        joinSQL += ` LEFT JOIN tb_customers cust    On cust.customerId = tb_bookings.customerId   `;
      }
    }

    let sql = `SELECT ${
      opts.columns || "*"
    } , IF(?,1,0) isScheduledOrder  , isDeliverNowOrder as  isHighlighted , if(status = 2 , 3 ,  pickerJobStatus) as pickerJobStatus ${joinSelectColumns}  FROM tb_bookings ${joinSQL}  WHERE  1  AND tb_bookings.verticalType = ${
      constants.verticalType.GROCERY
    } `;
    const params = [opts.isScheduledOrder];

    if (opts.inClause) {
      if (opts.inClause.status) {
        sql += ` AND status IN (?) `;
        params.push(opts.inClause.status);
      }

      if (opts.inClause.pickerJobStatus) {
        sql += ` AND  pickerJobStatus IN (?) `;
        params.push(opts.inClause.pickerJobStatus);
      }
    }

    if (opts.lessThanEqual) {
      if (opts.lessThanEqual.bookingDateTime) {
        sql += ` AND bookingDateTime <= ? `;
        params.push(opts.lessThanEqual.bookingDateTime);
      }

      if (opts.lessThanEqual.customerUpdatedAt) {
        sql += ` AND customerUpdatedAt < ? `;
        params.push(opts.lessThanEqual.customerUpdatedAt);
      }
    }

    if (opts.greaterAndEqual) {
      if (opts.greaterAndEqual.bookingDateTime) {
        sql += ` AND bookingDateTime >= ? `;
        params.push(opts.greaterAndEqual.bookingDateTime);
      }

      if (opts.greaterAndEqual.customerUpdatedAt) {
        sql += ` AND customerUpdatedAt >= ? `;
        params.push(opts.greaterAndEqual.customerUpdatedAt);
      }
    }

    if (opts.equalClause) {
      if (opts.equalClause.hasOwnProperty("verticalType")) {
        sql += ` AND verticalType =  ? `;
        params.push(opts.equalClause.verticalType);
      }
      if (opts.equalClause.hasOwnProperty("goodFleetJobId")) {
        sql += ` AND  tb_bookings.goodFleetJobId = ? `;
        params.push(opts.equalClause.goodFleetJobId);
      }

      if (opts.equalClause.assingedPickerId) {
        sql += ` AND  assingedPickers.pickerId = ? `;
        params.push(opts.equalClause.assingedPickerId);
      }

      if (opts.hasOwnProperty("isEditable")) {
        sql += ` AND  tb_bookings.isEditable = ? `;
        params.push(opts.equalClause.isEditable);
      }

      if (opts.equalClause.overAllBookingId) {
        sql += ` AND  tb_bookings.overAllBookingId = ? `;
        params.push(opts.equalClause.overAllBookingId);
      }

      if (opts.equalClause.bookingId) {
        sql += ` AND tb_bookings.bookingId = ? `;
        params.push(opts.equalClause.bookingId);
      }
      if (opts.equalClause.customerId) {
        sql += ` AND  tb_bookings.customerId = ? `;
        params.push(opts.equalClause.customerId);
      }
      if (opts.equalClause.hasOwnProperty("status")) {
        sql += ` AND  tb_bookings.status = ? `;
        params.push(opts.equalClause.status);
      }

      if (opts.equalClause.pickerId) {
        sql += ` And tb_bookings.pickerId = ? `;
        params.push(opts.equalClause.pickerId);
      }

      if (opts.equalClause.hasOwnProperty("pickerJobStatus")) {
        sql += ` And tb_bookings.pickerJobStatus = ? `;
        params.push(opts.equalClause.pickerJobStatus);
      }
    }

    if (opts.notInClause) {
      if (opts.notInClause.status) {
        sql += ` And tb_bookings.status NOT  IN  (?) `;
        params.push(opts.notInClause.status);
      }

      if (opts.notInClause.pickerJobStatus) {
        sql += ` And tb_bookings.pickerJobStatus NOT  IN  (?) `;
        params.push(opts.notInClause.pickerJobStatus);
      }
    }

    if (opts.isNullCheck) {
      if (opts.isNullCheck.pickerId) {
        sql += ` And tb_bookings.pickerId  IS NULL  `;
      }
    }

    if (opts.notEqualClause) {
      if (opts.notEqualClause.hasOwnProperty("pickerJobStatus")) {
        sql += ` And tb_bookings.pickerJobStatus  <> ? `;
        params.push(opts.notEqualClause.pickerJobStatus);
      }
    }

    if (opts.getRemainingJobs) {
      sql += ` GROUP BY  tb_bookings.overAllBookingId `;
    }

    sql += ` ORDER BY tb_bookings.bookingId DESC `;

    if (opts.limit) {
      sql += ` LIMIT ? OFFSET ?  `;
      params.push(opts.limit, opts.skip);
    }

    return mysqlService.runMysqlQueryPromisified(
      "GET_BOOKINGS",
      sql,
      params,
      transactionConnection
    );
  } catch (error) {
    throw error;
  }
}

function getEnterPriceData(opts) {
  try {
    const sql = ` SELECT tb_admins.*  FROM tb_admins WHERE enterpriceReferenceId = ? `;
    return mysqlService.runMysqlQueryPromisified("GET_ENTERPRICE_DATA", sql, [
      opts.enterpriceReferenceId,
    ]);
  } catch (error) {
    throw error;
  }
}

function getCompleteData(adminId, selectedVerticalType) {
  try {
    let params = [adminId];
    let sql = `select adminId,group_concat('{','"menuId"',':',menuId,',','"status"',':','"',status,'"',',','"verticalType"',':',verticalType,'}') as roles from tb_roles 
    INNER JOIN tb_admin_roles USING(menuId) where adminId= ? `;

    if (selectedVerticalType) {
      sql += `and verticalType = ? `;
      params.push(selectedVerticalType);
    }

    sql += `group by adminId`;

    console.log("sql", sql);
    return mysqlService.runMysqlQueryPromisified(
      "GETING_USER_DATA",
      sql,
      params
    );
  } catch (err) {
    throw err;
  }
}

function insertEnterPriceSettings(opts, transactionConnection) {
  try {
    const obj = {
      adminId: opts.adminId,
      enterpriceReferenceId: opts.enterpriceReferenceId,
    };

    const sql = ` INSERT INTO tb_enterprice_settings SET ?  `;
    return mysqlService.runMysqlQueryPromisified(
      "INSERT_ENTERPRICE_SETTINGS",
      sql,
      [obj],
      transactionConnection
    );
  } catch (error) {
    throw error;
  }
}

function varifyAll(obj) {
  try {
    let sql =
      "SELECT * FROM tb_admins WHERE adminId IS NOT NULL AND isDeleted!=1";
    let params = [];
    if (obj.emailAndPhone) {
      sql += " AND (email=? or phoneNo=?)";
      params.push(obj.email, obj.phoneNo);
    }
    if (obj.masterAdminId) {
      sql += " AND masterAdminId=?";
      params.push(obj.masterAdminId);
    }
    if (obj.equalClause) {
      if (obj.equalClause.sID) {
        sql += " AND adminId=?";
        params.push(obj.equalClause.sID);
      }

      if (obj.page) {
        sql += ` LIMIT ${obj.page.limit} OFFSET ${obj.page.skip}`;
      }
    }
    if (obj.fetch) {
      sql = `select *,group_concat('{','"menuId"',':',menuId,',','"status"',':','"',status,'"',',','"verticalType"',':',verticalType,'}') as roles from tb_admins
      INNER JOIN tb_admin_roles USING(adminId) where masterAdminId = ${obj.masterAdminId} AND isDeleted!=1 GROUP BY tb_admins.adminId`;
    }
    if (obj.notEqualClause) {
      if (obj.notEqualClause.sID) {
        console.log("case3");
        sql += " AND adminId!=?";
        params.push(obj.notEqualClause.sID);
        // console.log(sql)
        // console.log(params)
      }
      if (obj.notEqualClause.masterAdminId) {
        sql += " AND masterAdminId!=?";
        params.push(obj.notEqualClause.masterAdminId);
      }
    }

    if (obj.search) {
      sql += ` AND (
          tb_admins.name   Like  "${obj.search.replace('"', "")}%" OR  
          tb_admins.email Like  "${obj.search.replace('"', "")}%" ) `;
    }

    // console.log("-0-0-0-0-0-0-")
    console.log(sql);
    // console.log('000000000000000000', obj, '0000000000000000000000000')
    return mysqlService.runMysqlQueryPromisified(
      "FIND DUPLICATES AND STUFF",
      sql,
      params
    );
  } catch (err) {
    throw err;
  }
}

function authenticateEmailWithEnterpriceId(opts) {
  try {
    const sql = ` SELECT  tb_admins.*  FROM tb_admins WHERE enterpriceReferenceId = ? AND email = ? `;
    return mysqlService.runMysqlQueryPromisified(
      "AITH_WITH_ENTERPRICE_ID",
      sql,
      [opts.enterpriceReferenceId, opts.email]
    );
  } catch (error) {
    throw error;
  }
}

module.exports = {
  authenticateEmail,
  authenticateEmailWithEnterpriceId,
  varifyAll,
  insertEnterPriceSettings,
  getCompleteData,
  getEnterPriceData,
  getGroceryBooking,
  unblockCustomer,
  blockCustomer,
  deleteCustomer,
  getCustomerDetails,
  getAllCustomers,
  updateAdminDetails,
  insertAdmin,
  authenticateLanguage
};
