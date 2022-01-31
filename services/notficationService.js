
const FCM = require("fcm-node");
const Promise = require("bluebird");
const apns = require("apn");
const notificationMessagesJson = require("./../messages/notificationMessages");
const path = require("path");
const constant = require("./../properties/constants");
const Handlebars = require("handlebars");

const logg = require("./logging");
const mysqlService = require("./../databases/mysql/mysql");


function sendBulfNotifications(opts) {
  return new Promise((resolve, reject) => {
    let promiseArray = [];
    let iosPromiseArray = [];
    let users = [];
    let tokens = {};
    let i = 0;
    opts.data.on('data', (set) => {
      logg.log("DATA==>",set);
      if ((set.deviceToken)
        && !tokens.hasOwnProperty(set.deviceToken)
      ) {
        tokens[set.deviceToken] = 1;
        if (i < 1000) {
          console.log(set.firstName)
          users.push(set.deviceToken)
          i++;
        }
        else {
          console.log("IN_SEND_ANDROID_PUSH");
          promiseArray.push(sendAndroidPushNotification({
            adminId : opts.adminId ,
            appType : constant.appTypes.CUSTOMER ,
            deviceType : constant.deviceTypes.ANDROID ,
            registrationIds: users,
            message: {
              title: 'Test Notification',
              body: `Hey man , its just a test`,
              sound: 'default'
            },
            data: {
              // pushFlag: 12,
              // bookingId: 14,
              // message: {
              //   title: 'Test Notification',
              //   body: `Hey man , its just a test`,
              //   sound: 'default'
              // }
            }
          }))
          users = []
          i = 0;
        }
      }
      // if(set.deviceType == 'IOS' && set.deviceToken) {
      //   iosPromiseArray.push(sendIosNotfication({
      //     registrationIds: set.deviceToken,
      //     message: {
      //       title: opts.title,
      //       body: opts.message,
      //       sound: 'default'
      //     },
      //     data: {
      //     }
      //   }))
      // }
    })
    opts.data.on('end', () => {
      // console.log(users)
      if (users.length > 0) {
        promiseArray.push(sendAndroidPushNotification({
          adminId : opts.adminId ,
          appType : constant.appTypes.CUSTOMER ,
          deviceType :  constant.deviceTypes.ANDROID ,
          registrationIds: users,
          message: {
            title: opts.title,
            body: opts.message,
            sound: 'default'
          },
          data: {
            // pushFlag: 12,
            // bookingId: 14,
            // message: {
            //   title: 'Test Notification',
            //   body: `Hey man , its just a test`,
            //   sound: 'default'
            // }
          }
        }))
      };

      Promise.all(iosPromiseArray).then(()=>{
        console.log("ios set complete")
      })
      .catch(err=>{
        console.log("ios notification send recieved got errors",err)
      })
      Promise.all(promiseArray).then(() => {
        // console.log('done');
        resolve('all set and done')
      }).catch((err) => {
        console.log('error is this--->', err);
        let resErr =  {};
        if(err && (typeof err == 'string')){
          resErr  = JSON.parse(err);
        }
        
        if (resErr.success) {
          resolve(resErr)
        }
        resolve('didnt work')
      })
    })
  })
}


function sendAndroidPushNotification(opts) {
  return new Promise((resolve, reject) => {
    Promise.coroutine(function*(){
      const sql = `SELECT fcmKey FROM tb_device_settings WHERE appType = ? AND deviceType = ?  AND adminId = ?` ;
      const fcmKeys = yield  mysqlService.runMysqlQueryPromisified('GETTING_FCM_KEYS',sql,[opts.appType,opts.deviceType,opts.adminId]);

      if(!fcmKeys || !fcmKeys.length || !fcmKeys[0].fcmKey){
        logg.log("FCM_KEY_NOT_PRESENT");
        return reject({});
      }

      const fcm = new FCM(fcmKeys[0].fcmKey);
      logg.log("OPTS_IN_SEND_ANDROID", opts);
      if (opts.message) {
        opts.message.sound = 'default';
      };
      const message = {
        registration_ids: opts.registrationIds,
        // registration_ids: ['ffFIYlStSA-KbgkyhW1apr:APA91bGV6fik2_c2hPp6zUCBdDSrdBypZWs_KvIfF4SUDTK7nmnmk3xgxJUOIIqdQDK12VoK24kscOJz61rP2jHVLpwOuBeJWNhXzEh6Ag9qfqWaIZ8d-8mpJEXtUVni46zL9GFTpJDl', 'cczvq3QsSuaxLenrBijMu1:APA91bGTpEnMU1ZBCUl0Fb327rfzBHne290QDl5dLWwZjkhrqlqvHG-Uyp5X9m0zIL5xEm79k-GyNYRmefhiDw1FjusWlynbgiogyaW1XZ125zYWdin5-F-qemYdWBxmWEts-SDYduS7'],
        time_to_live: 2419200,
        priority: "high",
        notification: opts.message,
        data: opts.data
      };
      // console.log(message)
      logg.log("MESSAGE_BEFORE_ANDROID_PUS", message);
  
      fcm.send(message, function (err, response) {
        logg.log("SEND_ANDROID_PUSH", {
          ERROR: err,
          RESPONSE: response
        });
        if (err) return reject(err);
        else return resolve(response);
      });

    })().then(()=>{

    }).catch((error)=>{
      return reject(error);
    })
  });
}

function sendIosNotfication(opts) {
  return new Promise((resolve, reject) => {
    try {
      logg.log("IN_SEND_IOS_PUSH=>", opts);
      const msg = opts.message;
      const pathSle = path.join(
        __dirname,
        ".." ,
        "/Certificates_live.p12"
      );

      console.log("path===>", pathSle);
      const options = {
        cert: pathSle,
        certData: null,
        key: pathSle,
        keyData: null,
        passphrase: '123456',
        ca: null,
        pfx: null,
        pfxData: null,
        gateway: "gateway.push.apple.com",
        port: 2195,
        rejectUnauthorized: true,
        enhanced: true,
        cacheLength: 100,
        autoAdjustCache: true,
        connectionTimeout: 0,
        ssl: true ,
        production : true
      };

      //var deviceToken = new apns.Device(iosDeviceToken);
      const apnsConnection = new apns.Connection(options);
      const note = new apns.Notification();

      note.expiry = Math.floor(Date.now() / 1000) + 3600;
      note.contentAvailable = 1;
      note.badge = 0;
      note.sound = "ping.aiff";
      note.alert = opts.data.message;
      note.payload = opts.data ; 

      apnsConnection.pushNotification(note, opts.registrationIds[0]);
      // Handle these events to confirm that the notification gets
      // transmitted to the APN server or find error if any

      function log(type) {
        return function (data) {
            console.log("iOS PUSH NOTIFICATION RESULT: ", type);
            console.log("iOS PUSH NOTIFICATION RESULT_DATA: ", data);
        }
      }

      apnsConnection.on('transmissionError', function (err, n, c) {
        console.log('transmissionError', err, n, c, "DeviceType => ");
      });

      apnsConnection.on('error', log('error'));
      apnsConnection.on('transmitted', log('transmitted'));
      apnsConnection.on('timeout', log('timeout'));
      apnsConnection.on('connected', log('connected'));
      apnsConnection.on('disconnected', log('disconnected'));
      apnsConnection.on('socketError', (error) => {
        console.log("socket_error==>", error);
      });
      apnsConnection.on('transmissionError', log('transmissionError'));
      apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
    } catch (error) {
      console.log("error_while_ios_notification=>", error);
    }
    return resolve();
  });
}

function sendNotification(opts) {
  return new Promise((resolve, reject) => {
    Promise.coroutine(function* () {
      logg.log("OPTS_IN_PUSH", opts);
      replaceTempalteVariables(opts);
      logg.log("FORMATTED_MESSAGE", opts.message);
      yield sendAndroidPushNotification(opts);
      // if (opts.deviceType == constant.deviceTypes.ANDROID) {
       
      // } else if (opts.deviceType == constant.deviceTypes.IOS) {
      //   yield sendIosNotfication(opts);
      // } else {
      //   return resolve(0);
      // }

      // saveNotification({
      //   device_type: opts.device_type,
      //   notification_text: opts.message,
      //   receiver_id: opts.user_id,
      //   notification_type: constant.notificationTypes.PUSH
      // })
      //   .then(() => {})
      //   .catch(error => {
      //     console.log("Error_While_Sacving_Notification", error);
      //   });

      return resolve(1);
    })()
      .then(() => { })
      .catch(error => {
        console.log("error_while_send_notfication", error);
        return reject(error);
      });
  });
}

function replaceTempalteVariables(opts) {
  logg.log("OPTS_IN_REPLACE_TEMP", opts);
  opts.language = opts.language;
  logg.log("JSON_MESSAGE=>", notificationMessagesJson[opts.language][opts.message]);
  opts.message = JSON.parse(
    JSON.stringify(
      notificationMessagesJson[opts.language][
      opts.message
      ]
    ));
  console.log("COMPILED_MESG=>", opts.message.body);
  console.log("TEMPLATE_OBJ=>", opts.bodyTemplateKeys)

  opts.message.body = Handlebars.compile(opts.message.body)(opts.bodyTemplateKeys);
  opts.data.message = opts.message.body;
}

function saveNotification(opts) {
  return new Promise((resolve, reject) => {
    logg.log("OPTS_IN_SAVE_NOTIFICATION", opts);
    const sql = `INSERT INTO tb_notifications  SET ?`;
    const obj = {};
    opts.hasOwnProperty("device_type")
      ? (obj.device_type = opts.device_type)
      : 0;
    opts.notification_text
      ? (obj.notification_text = opts.notification_text)
      : 0;
    opts.receiver_id ? (obj.receiver_id = opts.receiver_id) : 0;
    opts.hasOwnProperty("notification_type")
      ? (obj.notification_type = opts.notification_type)
      : 0;
    opts.receiver_phone ? (obj.receiver_phone = opts.receiver_phone) : 0;
    const query = connection.query(sql, [obj], (error, result) => {
      logg.log("SAVING_NOTIFICATIONS", {
        ERROR: error,
        RESULT: result,
        SQL: query.sql
      });
      if (error) return reject(error);
      return resolve(result);
    });
  });
}

module.exports = {
  sendNotification,
  replaceTempalteVariables,
  sendIosNotfication,
  saveNotification,
  sendBulfNotifications
};
