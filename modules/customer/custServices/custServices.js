const Promise = require("bluebird");
const moment = require("moment");

const logg = require("./../../../services/logging");
const mysqlService = require("./../../../databases/mysql/mysql");

const constants = require("./../../../properties/constants");

function authenticateEmail(email) {
  console.log("authenticateEmail", email);
  return new Promise((resolve, reject) => {
    let sql = `SELECT * from tb_customers where email='${email}'`;
    const query = connection.query(sql, (error, result) => {
      logg.log("AUTHENTICATE_EMAIL_RESULT", {
        ERROR: error,
        RESULT: result,
        SQL: query.sql,
      });
      if (error) return reject(error);
      return resolve(result);
    });
  });
}
function insertCust(userDetails, transactionConnection) {
  try {
    const obj = {};
    userDetails.firstName ? (obj.firstName = userDetails.firstName) : 0;
    userDetails.lastName ? (obj.lastName = userDetails.lastName) : 0;
    userDetails.email ? (obj.email = userDetails.email) : 0;
    userDetails.password ? (obj.password = userDetails.password) : 0;
    userDetails.phoneNo ? (obj.phoneNo = userDetails.phoneNo) : 0;
    userDetails.countryCode ? (obj.countryCode = userDetails.countryCode) : 0;
    userDetails.socialId ? (obj.socialId = userDetails.socialId) : 0;
    userDetails.profilePicUrl
      ? (obj.profilePicUrl = userDetails.profilePicUrl)
      : 0;
    userDetails.socialMode ? (obj.socialMode = userDetails.socialMode) : 0;
    userDetails.otpCode ? (obj.otpCode = userDetails.otpCode) : 0;
    userDetails.hasOwnProperty("isLoggedIn")
      ? (obj.isLoggedIn = userDetails.isLoggedIn)
      : 0;
    userDetails.hasOwnProperty("phoneVerified")
      ? (obj.phoneVerified = userDetails.phoneVerified)
      : 0;
    userDetails.gender ? (obj.gender = userDetails.gender) : 0;
    userDetails.dateOfBirth
      ? (obj.dateOfBirth = moment(userDetails.dateOfBirth, "DD-MM-YYYY").format(
          "YYYY-MM-DD"
        ))
      : 0;
    userDetails.transactionId ? (obj.transactionId = userDetails.transactionId) : 0;
    // obj.coords = ``
    const sql = `INSERT INTO tb_customers SET  ?  `;
    return mysqlService.runMysqlQueryPromisified(
      "INSERT_CUSTOMER",
      sql,
      [obj],
      transactionConnection
    );
  } catch (error) {
    throw error;
  }
}

function updateCustomer(userDetails, customerId, transactionConnection) {
  logg.log("UPDATE_CUSTOMER=>", userDetails);
  try {
    const obj = {};
    userDetails.firstName ? (obj.firstName = userDetails.firstName) : 0;
    userDetails.lastName ? (obj.lastName = userDetails.lastName) : 0;
    userDetails.email ? (obj.email = userDetails.email) : 0;
    userDetails.password ? (obj.password = userDetails.password) : 0;
    userDetails.phoneNo ? (obj.phoneNo = userDetails.phoneNo) : 0;
    userDetails.countryCode ? (obj.countryCode = userDetails.countryCode) : 0;
    userDetails.language ? (obj.language = userDetails.language) : 0;
    userDetails.socialId ? (obj.socialId = userDetails.socialId) : 0;
    userDetails.profilePicURL
      ? (obj.profilePicURL = userDetails.profilePicURL)
      : 0;
    userDetails.socialMode ? (obj.socialMode = userDetails.socialMode) : 0;
    userDetails.hasOwnProperty("isBlocked")
      ? (obj.isBlocked = userDetails.isBlocked)
      : 0;
    userDetails.hasOwnProperty("isLoggedIn")
      ? (obj.isLoggedIn = userDetails.isLoggedIn)
      : 0;
    userDetails.hasOwnProperty("phoneVerified")
      ? (obj.phoneVerified = userDetails.phoneVerified)
      : 0;
    userDetails.passwordResetToken
      ? (obj.passwordResetToken = userDetails.passwordResetToken)
      : 0;
    userDetails.otpCode ? (obj.otpCode = userDetails.otpCode) : 0;
    userDetails.hasOwnProperty("IsDeleted")
      ? (obj.IsDeleted = userDetails.IsDeleted)
      : 0;
    userDetails.hasOwnProperty("isUpdated")
      ? (obj.isUpdated = userDetails.isUpdated)
      : 0;
    userDetails.dateOfBirth
      ? (obj.dateOfBirth = moment(userDetails.dateOfBirth, "DD-MM-YYYY").format(
          "YYYY-MM-DD"
        ))
      : 0;
    // userDetails.firebaseUID ? (obj.firebaseUID = userDetails.firebaseUID) : 0;
    // userDetails.hasOwnProperty("verifiedViaFirebase")
    //   ? (obj.verifiedViaFirebase = userDetails.verifiedViaFirebase)
    //   : 0;
    let sql = "UPDATE tb_customers SET ? WHERE customerId =  ? ";
    return mysqlService.runMysqlQueryPromisified(
      "UPDATE_CUSTOMER=>",
      sql,
      [obj, customerId],
      transactionConnection
    );
  } catch (error) {
    throw error;
  }
}

function getCustomer(opts) {
  try {
    logg.log("OPTS_IN_GET_CUSTOMER=>", opts);

    let sql = ` SELECT ${
      opts.columns || "tb_customers.*"
    } FROM tb_customers WHERE 1 AND tb_customers.isDeleted = 0   `;
    const params = [];
    if (opts.equalClause) {
      if (opts.equalClause.countryCode) {
        if (opts.equalClause.countryCode.indexOf("+") != -1) {
          sql += ` AND  (countryCode = ? OR countryCode = ?)  `;
          params.push(
            opts.equalClause.countryCode,
            opts.equalClause.countryCode.substring(1)
          );
        } else {
          sql += ` AND  (countryCode = ? OR countryCode = ?)  `;
          params.push(
            opts.equalClause.countryCode,
            "+" + opts.equalClause.countryCode
          );
        }
      }

      if (opts.equalClause.passwordResetToken) {
        sql += ` AND  passwordResetToken = ?  `;
        params.push(opts.equalClause.passwordResetToken);
      }

      if (opts.equalClause.customerId) {
        sql += ` AND  tb_customers.customerId = ?  `;
        params.push(opts.equalClause.customerId);
      }
      if (opts.equalClause.socialId) {
        sql += ` AND  socialId = ?  `;
        params.push(opts.equalClause.socialId);
      }

      if (opts.equalClause.email) {
        sql += ` AND  email = ?  `;
        params.push(opts.equalClause.email);
      }
      if (opts.equalClause.phoneNo) {
        sql += ` AND  tb_customers.phoneNo = ?  `;
        params.push(opts.equalClause.phoneNo);
      }
      if (opts.equalClause.userName) {
        sql += ` AND  tb_customers.userName = ?  `;
        params.push(opts.equalClause.userName);
      }
    }

    if (opts.notEqualClause) {
      if (opts.notEqualClause.customerId) {
        sql += ` AND tb_customers.customerId <> ? `;
        params.push(opts.notEqualClause.customerId);
      }
    }

    if (opts.inClause) {
      if (opts.inClause.customerId) {
        sql += ` AND  tb_customers.customerId  IN (?)  `;
        params.push(opts.inClause.customerId);
      }
    }

    if (opts.searches && opts.searches.length) {
      sql += ` AND ( 0  `;
      for (let i = 0; i < opts.searches.length; i++) {
        sql += ` or  tb_customers.phoneNo   Like  "%${opts.searches[i].replace(
          '"',
          ""
        )}%" OR  
          firstName Like  "%${opts.searches[i].replace('"', "")}%" OR 
          lastName Like  "%${opts.searches[i].replace('"', "")}%" OR 
          email Like "%${opts.searches[i].replace('"', "")}%" OR
          userName Like "%${opts.search.replace('"', "")}%" `;
      }

      sql += ` )  `;
    }

    if (opts.search) {
      sql += ` AND (
          tb_customers.phoneNo   Like  "%${opts.search.replace('"', "")}%" OR  
          firstName Like  "%${opts.search.replace('"', "")}%" OR 
          lastName Like  "%${opts.search.replace('"', "")}%" OR 
          email Like "%${opts.search.replace('"', "")}%" OR
          userName Like "%${opts.search.replace('"', "")}%" ) `;
    }

    if (opts.notEqualClause) {
      if (opts.notEqualClause.customerId) {
        sql += ` AND tb_customers.customerId <> ? `;
        params.push(opts.notEqualClause.customerId);
      }
    }

    sql += ` ORDER BY tb_customers.customerId DESC `;

    if (opts.limit) {
      sql += ` LIMIT ? OFFSET ? `;
      params.push(opts.limit, opts.skip || 0);
    }

    if (opts.getStream) {
      return connection.query(sql, params).stream();
    }

    return mysqlService.runMysqlQueryPromisified(
      "GET_CUSTOMER",
      sql,
      params
    );
  } catch (error) {
    throw error;
  }
}

function saveSearchHistory(opts, transactionConnection) {
  // try {
  //   let sql = `INSERT INTO tb_customer_searches SET ?` ;
  //   return  mysqlService.runMysqlQueryPromisified("GETTING_ADD_SEARCH_HISTORY",sql, opts);
  // } catch (error) {
  //   throw error;
  // }
  return new Promise((resolve, reject) => {
    Promise.coroutine(function* () {
      let params = [opts.adminId];
      let sql = ` SELECT COUNT(*) AS count FROM tb_customer_searches WHERE adminId=? `;

      if (opts.customerId) {
        sql += ` AND customerId=?`;
        params.push(opts.customerId);
      }
      if (opts.deviceToken) {
        sql += ` AND deviceToken=?`;
        params.push(opts.deviceToken);
      }

      let customerHistoryCount = yield mysqlService.runMysqlQueryPromisified(
        "COUNT_CUSTOMER_HISTORY",
        sql,
        params,
        transactionConnection
      );

      if (customerHistoryCount[0].count > 10) {
        let criteria = "";
        if (opts.customerId) {
          criteria += ` AND customerId=?`;
          params.push(opts.customerId);
        }
        if (opts.deviceToken) {
          criteria += ` AND deviceToken=?`;
          params.push(opts.deviceToken);
        }
        sql = ` DELETE FROM tb_customer_searches WHERE adminId=? ${criteria} ORDER BY searchId LIMIT 1`;
        yield mysqlService.runMysqlQueryPromisified(
          "GETTING_ADMIN_SETTINGS",
          sql,
          params,
          transactionConnection
        );
      }

      // sql = `INSERT IGNORE INTO tb_customer_searches SET ? ` ;
      sql =
        "INSERT INTO tb_customer_searches(keyword,adminId,customerId,deviceToken,creationDate) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE creationDate=VALUES(creationDate) ";
      yield mysqlService.runMysqlQueryPromisified("ADD_SEARCH_HISTORY", sql, [
        opts.keyword,
        opts.adminId,
        opts.customerId,
        opts.deviceToken,
        opts.creationDate,
      ]);

      return resolve({});
    })()
      .then(() => {})
      .catch((error) => {
        throw error;
      });
  });
}

function getPosts(opts) {
  try {
    logg.log("OPTS_IN_GET_Post=>", opts);

    let sql = ` SELECT ${
      opts.columns || "tb_posts.*"
    } FROM tb_posts INNER JOIN tb_customers USING(customerId) WHERE 1 AND tb_posts.isDeleted = 0   `;
    const params = [];
    if (opts.equalClause) {

      if (opts.equalClause.customerId) {
        sql += ` AND  tb_posts.customerId = ?  `;
        params.push(opts.equalClause.customerId);
      }
      if (opts.equalClause.userName) {
        sql += ` AND  tb_customers.userName = ?  `;
        params.push(opts.equalClause.phoneNo);
      }
    }

    if (opts.notEqualClause) {
      if (opts.notEqualClause.customerId) {
        sql += ` AND tb_customers.customerId <> ? `;
        params.push(opts.notEqualClause.customerId);
      }
    }

    if (opts.inClause) {
      if (opts.inClause.customerId) {
        sql += ` AND  tb_customers.customerId  IN (?)  `;
        params.push(opts.inClause.customerId);
      }
    }
    if (opts.greaterAndEqual) {
      if (opts.greaterAndEqual.createdAt) {
        sql += ` AND Date(tb_posts.createdAt) >= Date(?)`;
        params.push(opts.greaterAndEqual.createdAt);
      }

      if (opts.greaterAndEqual.createdAt) {
        sql += ` AND Date(tb_posts.createdAt)  >= Date(?) `;
        params.push(opts.greaterAndEqual.createdAt);
      }
    }

    if (opts.lessThanEqual) {
      if (opts.lessThanEqual.createdAt) {
        sql += ` AND Date(tb_posts.createdAt)  <= Date(?) `;
        params.push(opts.lessThanEqual.createdAt);
      }

      if (opts.lessThanEqual.createdAt) {
        sql += ` AND Date(tb_posts.createdAt) <= Date(?)`;
        params.push(opts.lessThanEqual.createdAt);
      }
    }

    if (opts.searches && opts.searches.length) {
      sql += ` AND ( 0  `;
      for (let i = 0; i < opts.searches.length; i++) {
        sql += ` or  tb_customers.phoneNo   Like  "%${opts.searches[i].replace(
          '"',
          ""
        )}%" OR  
        tb_customers.firstName Like  "%${opts.searches[i].replace('"', "")}%" OR 
        tb_customers.lastName Like  "%${opts.searches[i].replace('"', "")}%" OR 
        tb_customers.email Like "%${opts.searches[i].replace('"', "")}%" `;
      }

      sql += ` )  `;
    }

    if (opts.search) {
      sql += ` AND (
          tb_customers.phoneNo   Like  "%${opts.search.replace('"', "")}%" OR  
          tb_customers.firstName Like  "%${opts.search.replace('"', "")}%" OR 
          tb_customers.lastName Like  "%${opts.search.replace('"', "")}%" OR 
          tb_customers.email Like "%${opts.search.replace('"', "")}%" OR
          tb_customers.userName Like "%${opts.search.replace('"', "")}%" ) `;
    }

    if (opts.notEqualClause) {
      if (opts.notEqualClause.customerId) {
        sql += ` AND tb_customers.customerId <> ? `;
        params.push(opts.notEqualClause.customerId);
      }
    }

    sql += ` ORDER BY tb_posts.createdAt DESC `;

    if (opts.limit) {
      sql += ` LIMIT ? OFFSET ? `;
      params.push(opts.limit, opts.skip || 0);
    }

    if (opts.getStream) {
      return connection.query(sql, params).stream();
    }

    return mysqlService.runMysqlQueryPromisified(
      "GET_POST",
      sql,
      params,
      transactionConnection
    );
  } catch (error) {
    throw error;
  }
}

function createPost(userDetails, transactionConnection) {
  try {
    var obj ={};
    userDetails.customerId ? (obj.customerId = userDetails.customerId) : 0;
    userDetails.photoUrl ? (obj.photoUrl = userDetails.photoUrl) : 0;
    userDetails.description ? (obj.description = userDetails.description) : 0;
    userDetails.createdAt
      ? (obj.createdAt=userDetails.createdAt)
      : 0;
    userDetails.userName?(obj.userName=userDetails.userName):0;

    // obj.coords = ``
    const sql = `INSERT INTO tb_posts SET  ?  `;
    return mysqlService.runMysqlQueryPromisified(
      "INSERT_POST",
      sql,
      [obj],
      transactionConnection
    );
  } catch (error) {
    throw error;
  }
}


function likePost(opts) {
  try {
    logg.log("OPTS_IN_GET_Post=>", opts);
    let opr=`SET `
    if(opts.like)
    {
      opr +=` totalLikes = totalLikes+1 `;
    }
    else
    {
      opr +=` totalLikes = totalLikes-1 `;
    }
    let sql = `UPDATE  tb_posts ${opr} where postId=?`;
    return mysqlService.runMysqlQueryPromisified(
      "GET_POST",
      sql,
      [opts.postId]
    );
  } catch (error) {
    throw error;
  }
}


function addToLikedPost(opts, transactionConnection) {
  try {
    logg.log("OPTS_IN_GET_Post=>", opts);
    let sql;
    if(opts.like)
    {
      sql = `insert into tb_post_likes set postId= ${opts.postId}, customerId= ${opts.customerId} `
    }
    else
    {
      sql = `DELETE  from tb_post_likes where postId= ${opts.postId} AND  customerId= ${opts.customerId} `
    }
    return mysqlService.runMysqlQueryPromisified(
      "GET_POST",
      sql,
      [],
      transactionConnection
    );
  } catch (error) {
    throw error;
  }
}

function addToFollow(opts,customerId, transactionConnection) {
  try {
    logg.log("OPTS_IN_GET_Post=>", opts);
    let sql;
    if(opts.follow)
    {
      sql = `insert into tb_follows set followedcustomerId= ${opts.customerId}, customerId= ${customerId} `
    }
    else
    {
      sql = `DELETE  from tb_follows where followedcustomerId= ${opts.customerId} AND  customerId= ${customerId} `
    }
    return mysqlService.runMysqlQueryPromisified(
      "GET_POST",
      sql,
      [],
      transactionConnection
    );
  } catch (error) {
    throw error;
  }
}

function getProfilePosts(opts) {
  try {
    logg.log("OPTS_IN_GET_Post=>", opts);
    if(opts.likes)
    {
      let sql = ` SELECT ${
        opts.columns || "tb_posts.*"
      } FROM tb_posts INNER JOIN tb_like_posts USING(customerId) WHERE 1 AND tb_posts.isDeleted = 0   `;
      const params = [];
      if (opts.equalClause) {
  
        if (opts.equalClause.customerId) {
          sql += ` AND  tb_posts.customerId = ?  `;
          params.push(opts.equalClause.customerId);
        }
        if (opts.equalClause.userName) {
          sql += ` AND  tb_customers.userName = ?  `;
          params.push(opts.equalClause.phoneNo);
        }
      }
  
      if (opts.notEqualClause) {
        if (opts.notEqualClause.customerId) {
          sql += ` AND tb_customers.customerId <> ? `;
          params.push(opts.notEqualClause.customerId);
        }
      }
  
      if (opts.inClause) {
        if (opts.inClause.customerId) {
          sql += ` AND  tb_customers.customerId  IN (?)  `;
          params.push(opts.inClause.customerId);
        }
      }
      if (opts.greaterAndEqual) {
        if (opts.greaterAndEqual.createdAt) {
          sql += ` AND Date(tb_posts.createdAt) >= Date(?)`;
          params.push(opts.greaterAndEqual.createdAt);
        }
  
        if (opts.greaterAndEqual.createdAt) {
          sql += ` AND Date(tb_posts.createdAt)  >= Date(?) `;
          params.push(opts.greaterAndEqual.createdAt);
        }
      }
  
      if (opts.lessThanEqual) {
        if (opts.lessThanEqual.createdAt) {
          sql += ` AND Date(tb_posts.createdAt)  <= Date(?) `;
          params.push(opts.lessThanEqual.createdAt);
        }
  
        if (opts.lessThanEqual.createdAt) {
          sql += ` AND Date(tb_posts.createdAt) <= Date(?)`;
          params.push(opts.lessThanEqual.createdAt);
        }
      }
  
      if (opts.searches && opts.searches.length) {
        sql += ` AND ( 0  `;
        for (let i = 0; i < opts.searches.length; i++) {
          sql += ` or  tb_customers.phoneNo   Like  "%${opts.searches[i].replace(
            '"',
            ""
          )}%" OR  
          tb_customers.firstName Like  "%${opts.searches[i].replace('"', "")}%" OR 
          tb_customers.lastName Like  "%${opts.searches[i].replace('"', "")}%" OR 
          tb_customers.email Like "%${opts.searches[i].replace('"', "")}%" `;
        }
  
        sql += ` )  `;
      }
  
      if (opts.search) {
        sql += ` AND (
            tb_customers.phoneNo   Like  "%${opts.search.replace('"', "")}%" OR  
            tb_customers.firstName Like  "%${opts.search.replace('"', "")}%" OR 
            tb_customers.lastName Like  "%${opts.search.replace('"', "")}%" OR 
            tb_customers.email Like "%${opts.search.replace('"', "")}%" OR
            tb_customers.userName Like "%${opts.search.replace('"', "")}%" ) `;
      }
  
      if (opts.notEqualClause) {
        if (opts.notEqualClause.customerId) {
          sql += ` AND tb_customers.customerId <> ? `;
          params.push(opts.notEqualClause.customerId);
        }
      }
  
      sql += ` ORDER BY tb_posts.createdAt DESC `;
  
      if (opts.limit) {
        sql += ` LIMIT ? OFFSET ? `;
        params.push(opts.limit, opts.skip || 0);
      }
  
      if (opts.getStream) {
        return connection.query(sql, params).stream();
      }
  
      return mysqlService.runMysqlQueryPromisified(
        "GET_POST",
        sql,
        params,
        transactionConnection
      );

    }
    else
    {
    let sql = ` SELECT ${
      opts.columns || "tb_posts.*"
    } FROM tb_posts  WHERE 1 AND tb_posts.isDeleted = 0   `;
    const params = [];
    if (opts.equalClause) {

      if (opts.equalClause.customerId) {
        sql += ` AND  tb_posts.customerId = ?  `;
        params.push(opts.equalClause.customerId);
      }
      if (opts.equalClause.userName) {
        sql += ` AND  tb_customers.userName = ?  `;
        params.push(opts.equalClause.phoneNo);
      }
    }

    if (opts.notEqualClause) {
      if (opts.notEqualClause.customerId) {
        sql += ` AND tb_customers.customerId <> ? `;
        params.push(opts.notEqualClause.customerId);
      }
    }

    if (opts.inClause) {
      if (opts.inClause.customerId) {
        sql += ` AND  tb_customers.customerId  IN (?)  `;
        params.push(opts.inClause.customerId);
      }
    }
    if (opts.greaterAndEqual) {
      if (opts.greaterAndEqual.createdAt) {
        sql += ` AND Date(tb_posts.createdAt) >= Date(?)`;
        params.push(opts.greaterAndEqual.createdAt);
      }

      if (opts.greaterAndEqual.createdAt) {
        sql += ` AND Date(tb_posts.createdAt)  >= Date(?) `;
        params.push(opts.greaterAndEqual.createdAt);
      }
    }

    if (opts.lessThanEqual) {
      if (opts.lessThanEqual.createdAt) {
        sql += ` AND Date(tb_posts.createdAt)  <= Date(?) `;
        params.push(opts.lessThanEqual.createdAt);
      }

      if (opts.lessThanEqual.createdAt) {
        sql += ` AND Date(tb_posts.createdAt) <= Date(?)`;
        params.push(opts.lessThanEqual.createdAt);
      }
    }

    if (opts.searches && opts.searches.length) {
      sql += ` AND ( 0  `;
      for (let i = 0; i < opts.searches.length; i++) {
        sql += ` or  tb_customers.phoneNo   Like  "%${opts.searches[i].replace(
          '"',
          ""
        )}%" OR  
        tb_customers.firstName Like  "%${opts.searches[i].replace('"', "")}%" OR 
        tb_customers.lastName Like  "%${opts.searches[i].replace('"', "")}%" OR 
        tb_customers.email Like "%${opts.searches[i].replace('"', "")}%" `;
      }

      sql += ` )  `;
    }

    if (opts.search) {
      sql += ` AND (
          tb_customers.phoneNo   Like  "%${opts.search.replace('"', "")}%" OR  
          tb_customers.firstName Like  "%${opts.search.replace('"', "")}%" OR 
          tb_customers.lastName Like  "%${opts.search.replace('"', "")}%" OR 
          tb_customers.email Like "%${opts.search.replace('"', "")}%" OR
          tb_customers.userName Like "%${opts.search.replace('"', "")}%" ) `;
    }

    if (opts.notEqualClause) {
      if (opts.notEqualClause.customerId) {
        sql += ` AND tb_customers.customerId <> ? `;
        params.push(opts.notEqualClause.customerId);
      }
    }

    sql += ` ORDER BY tb_posts.createdAt DESC `;

    if (opts.limit) {
      sql += ` LIMIT ? OFFSET ? `;
      params.push(opts.limit, opts.skip || 0);
    }

    if (opts.getStream) {
      return connection.query(sql, params).stream();
    }

    return mysqlService.runMysqlQueryPromisified(
      "GET_POST",
      sql,
      params,
      transactionConnection
    );
    }
  } catch (error) {
    throw error;
  }
}

function getExplorePosts(opts) {
  try {
    logg.log("OPTS_IN_GET_Post=>", opts);

    let sql = ` SELECT ${
      opts.columns || "tb_posts.*"
    } FROM tb_posts post LEFT JOIN tb_follows follows ON follows.followCustomerId=post.customerId WHERE 1 AND tb_posts.isDeleted = 0   `;
    const params = [];
    if (opts.equalClause) {

      if (opts.equalClause.customerId) {
        sql += ` AND  follows.customerId = ?  `;
        params.push(opts.equalClause.customerId);
      }
    }

    sql += ` ORDER BY tb_posts.createdAt DESC `;

    if (opts.limit) {
      sql += ` LIMIT ? OFFSET ? `;
      params.push(opts.limit, opts.skip || 0);
    }

    if (opts.getStream) {
      return connection.query(sql, params).stream();
    }

    return mysqlService.runMysqlQueryPromisified(
      "GET_POST",
      sql,
      params,
      transactionConnection
    );
  } catch (error) {
    throw error;
  }
}



module.exports = {
  getPosts,
  getCustomer,
  updateCustomer,
  insertCust,
  authenticateEmail,
  createPost,
  likePost,
  addToLikedPost,
  addToFollow,
  getProfilePosts,
  getExplorePosts
};
