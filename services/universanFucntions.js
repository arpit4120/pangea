const bcrypt = require("bcrypt");
const fs = require("fs");
const Promise = require("bluebird");
const validator = require("validator");
const   wordpressHash       = require("wordpress-hash-node");
const s3UploadStream = Promise.promisifyAll(require("s3-upload-stream"));

const constants = require("./../properties/constants");
const logg = require("./../services/logging");
const AWS = require("aws-sdk");

function encryptPassword(password) {
  console.log("password===>", password);
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, constants.becryptData.saltRounds, function (
      error,
      hash
    ) {
      logg.log("ENCRYPT_RESULT=>", { ERROR: error, RESULT: hash });
      if (error) return reject(error);
      return resolve(hash);
    });
  });
}

function checkPassword(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function (err, response) {
      logg.log("CHECK_PASSWORD_RESULT==>", { ERROR: err, RESPONSE: response });
      if (err) return reject(err);

      return resolve(response);
    });
  });
}

function generateRandomString(number) {
  console.log("My passsssssss string", number);
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTYZ0123456789";
  let numberCount = number || 4;
  for (let i = 0; i < numberCount; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  console.log("text", text);
  return text;
}

function uploadS3Image(files) {
  return new Promise((resolve, reject) => {
    let file = files.file || files.null;
    let file_name = file.name.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi,
      ""
    );
    let timestamp = new Date().getTime().toString();
    let str = "";
    let chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let size = chars.length;
    for (var i = 0; i < 4; i++) {
      var randomnumber = Math.floor(Math.random() * size);
      str = chars[randomnumber] + str;
    }
    file_name = file_name.replace(/\s/g, "");
    file_name = str + timestamp + "-" + file_name;
    file.name = file_name;
    if (file.thumbnail) {// Something went wrong!
      console.log('+++++++++++++++++++++++++++++')
      AWS.config.update({
        accessKeyId: config.get('s3Config.accessKeyId'),
        secretAccessKey: config.get('s3Config.secretKey'),
        region: config.get('s3Config.region')
      });

      const s3bucket = new AWS.S3({ region: config.get('s3Config.region') });

      const params = {
        Bucket: config.get("s3Config.bucketName"),
        Key: config.get('s3Config.folders.IMAGES') + "/" + file.name,
        Body: file.thumbnail,
        ACL: "public-read",
        ContentType: file.type
      };

      logg.log("IN_READ_FILE_PARAMS=>");
      s3bucket.putObject(params, function (err, data) {
        logg.log("ERROR=>", err);
        if (err) {
          console.log("Got error:", err.message);
          console.log("Request:");
          console.log(this.request.httpRequest);
          console.log("Response:");
          console.log(this.httpResponse);
          return resolve(false);
        }
        console.log("data===>", data);
        return resolve(file_name);
      });
    }
    else {
      console.log('_____________________________')
      fs.readFile(file.path, function (err, data) {
        if (err) throw err; // Something went wrong!
        AWS.config.update({
          accessKeyId: config.get('s3Config.accessKeyId'),
          secretAccessKey: config.get('s3Config.secretKey'),
          region: config.get('s3Config.region')
        });

        const s3bucket = new AWS.S3({ region: config.get('s3Config.region') });

        const params = {
          Bucket: config.get("s3Config.bucketName"),
          Key: config.get('s3Config.folders.IMAGES') + "/" + file.name,
          Body: data,
          ACL: "public-read",
          ContentType: file.type
        };

        logg.log("IN_READ_FILE_PARAMS=>");
        s3bucket.putObject(params, function (err, data) {
          logg.log("ERROR=>", err);
          if (err) {
            console.log("Got error:", err.message);
            console.log("Request:");
            console.log(this.request.httpRequest);
            console.log("Response:");
            console.log(this.httpResponse);
            return resolve(false);
          }
          console.log("data===>", data);
          return resolve(file_name);
        });
      });
    }
  });
}

async function sendEmailSendGrid(opts) {
  try {
    logg.log("OPTS_IN_SEND_EMAIL", opts);
    logg.log("OPTS_IN_SEND_EMAIL=>", opts);
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(config.get('emailCreds.SENDGRID_API_KEY'));
    const msg = {
      to: opts.to,
      from: config.get('emailCreds.FROM'),
      subject: opts.subject,
      html: opts.email
    };
    sgMail.send(msg, (error, result) => {
      console.log("error_and_REsult===>", error, result);
      return {};
    });
  } catch (error) {
    console.log("error_while_sending_email==>", error);
    return {};
  }
}

async function uploadCsvViaStream(stream, fileName) {
  return new Promise((resolve, reject) => {
    AWS.config.update({
      accessKeyId: config.get('s3Config.accessKeyId'),
      secretAccessKey: config.get('s3Config.secretKey'),
      region: config.get('s3Config.region')
    });
    const s3Stream = s3UploadStream(new AWS.S3());

    console.log("stream===>", stream);
    const upload = s3Stream.upload({
      ACL: "public-read",
      ContentType: "text/csv",
      Key: fileName,
      Bucket: config.get('s3Config.bucketName')
    });

    upload.on("error", error => {
      console.log("error_While_uploading===>", error);
      return reject(error);
    });

    upload.on("uploaded", async details => {
      console.log("uploaded====>", details);
      console.log("in_uploaded==>", fileName);

      return resolve(details.Location);
    });
    stream.pipe(upload);
  });
}

function transposeArray(arr) {
  for (let j = 0; j < arr.length; j++) {
    if (arr[j].length) {
      console.log("in_check=============>", j);
      return arr[j].map((col, i) => arr.map((row) => {
        if (row) {
          return row[i];
        } else {
          return "";
        }

      }));
    }
  }
}

function getRandomNumbers(length) {
  function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  };
  return shuffle("123456789".split('')).join('').substring(0, length || 6);
};




function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
};

function amPmToHours(time) {
  console.log(time);
  var hours = Number(time.match(/^(\d+)/)[1]);
  var minutes = Number(time.match(/:(\d+)/)[1]);
  var AMPM = time.match(/\s(.*)$/)[1];
  if (((AMPM == "pm" ) ||(AMPM == "PM" ) )  && hours < 12) hours = hours + 12;
  if (((AMPM == "am" ) ||(AMPM == "AM" ) )  && hours == 12) hours = hours - 12;
  var sHours = hours.toString();
  var sMinutes = minutes.toString();
  if (hours < 10) sHours = "0" + sHours;
  if (minutes < 10) sMinutes = "0" + sMinutes;
  return (sHours + ':' + sMinutes);
};

function timeToSeconds(time) {
  let a = time.split(':');
  let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60
  return seconds;
};

var convertTimeIntoLocal = function (date, timezone) {
  if (timezone == undefined || date == "0000-00-00 00:00:00") {
    return date;
  } else {
    var newDate = new Date(date),
      operator = timezone[0],
      millies = 300 * 60 * 1000;
    console.log("operator==>", operator);
    console.log("data_before===>", newDate);

    if (millies<0) {
      newDate.setTime(newDate.getTime() -  millies);
    } else {
      console.log("else_Case===>");
      newDate.setTime(newDate.getTime() - millies);
    }

    return newDate;
  }
};

function fbAuth(id) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * from CUSTOMER where userID='${id}'`
    const query = connection.query(sql, (error, result) => {
      logg.log("AUTHENTICATED_RESULT", {
        ERROR: error,
        RESULT: result,
        SQL: query.sql
      });
      if (error) return reject(error);
      return resolve(result);
    });
  });
};


const verifyEmailFormat = function (string) {
  return validator.isEmail(string);
};


function renderMessages(templateData, variablesData) {
  const Handlebars = require("handlebars");
  return Handlebars.compile(templateData)(variablesData);
}


  function convertTimeIntoUtc  (date, timezone) {
  if (timezone == undefined || date == '0000-00-00 00:00:00') {
      return date;
  } else {
      var newDate = new Date(date), millies = (timezone * 60 * 1000);
     let  operator = timezone[0] ;
      if (operator == "-") {
        newDate.setTime(newDate.getTime() + millies);
      } else {
        newDate.setTime(newDate.getTime() - millies);
      }
      return newDate;
  }
};

function decryptWordpressPassword(password,hash){
 try {
    return  wordpressHash.CheckPassword(password, hash)
  } catch(error){
    return false ;
  }
};


function calculateProdPrice(costPrice, margin, shst,ghst) {
  let actualPrice = Number(costPrice);
  (margin) ? actualPrice = actualPrice + (costPrice * Number(margin) / 100) : 0;
  //(shst) ? actualPrice = actualPrice + (costPrice * Number(shst) / 100) : 0;
  //(ghst) ? actualPrice = actualPrice + (costPrice * Number(ghst) / 100) : 0 ;

  actualPrice = (actualPrice) || 0;
  return actualPrice;
};




module.exports = {
  decryptWordpressPassword ,
  calculateProdPrice,
  getRandomNumbers,
  encryptPassword,
  checkPassword,
  generateRandomString,
  uploadS3Image,
  sendEmailSendGrid,
  uploadCsvViaStream,
  transposeArray,
  fbAuth ,
  verifyEmailFormat ,
  renderMessages ,
  convertTimeIntoUtc , 
  amPmToHours,
  formatAMPM,
  timeToSeconds,
  convertTimeIntoLocal,
  transposeArray,
  fbAuth,
  verifyEmailFormat,
  renderMessages
};
