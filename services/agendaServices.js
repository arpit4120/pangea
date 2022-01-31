const Promise = require("bluebird");
const logg = require("./../services/logging");
const request = Promise.promisify(require("request"));
const mongoService = require("./../databases/mongo/mongo");
const constants = require("./../properties/constants");

const responses = require("./../services/responses");

function scheduleJob(croneName, time, apiUrl, reqParams, method) {
  return new Promise((resolve, reject) => {
    Promise.coroutine(function*() {
      if (!croneName.length) return resolve(0);
      logg.log({
        CRON_NAME: croneName,
        API_URL: apiUrl,
        REQ_PARAMS: reqParams,
        METHOD: method,
        TIME: time
      });

      yield agenda.start();

      logg.log("BEFORE_DEFINE", {
        REQ_PARAMS: reqParams,
        method: method
      });

      agenda.define(croneName, (job, done) => {
        Promise.coroutine(function*() {
          let options = {
            url: job.attrs.data.apiUrl,
            method: job.attrs.data.method,
            json: true,
            body: job.attrs.data.reqParams
          };

          logg.log("OPTIONS", options);

          let reqestResult = yield request(options);

          logg.log("SCHEDULED_JOB_RESULT", reqestResult);

          done();
        })()
          .then(() => {})
          .catch(error => {
            console.log("error_in_schedule_job_function=>", error);
          });
      });
      console.log("time====>", time);

      let croneJob = yield agenda.every(time, croneName, {
        reqParams,
        method,
        apiUrl
      });

      logg.log("CRONE_JOB", croneJob);
      return resolve(1);
    })()
      .then(() => {})
      .catch(error => {
        console.log("error_while_scheduling=>", error);
      });
  });
}

async function scheduleCronViaAgenda(req, res) {
  try {
    scheduleJob(
      req.body.jobName,
      req.body.scheduleString,
      req.body.apiUrl,
      {},
      req.body.method
    );
    return responses.sendCustomSuccessResponse(
      res,
      constants.defaultLanguage,
      {}
    );
  } catch (error) {
    console.log("scheduleCronViaAgendaError=>", error);
    return responses.sendCustomErrorResponse(res, constants.defaultLanguage);
  }
}

async function scheduleRefreshTokenCron() {
  try {
    logg.log("SCHEDULE_REFRESH_TOKEN_CRON");
    await mongoService.deleteData(config.get('mongoCollections.agenaCollection'), {
      name: constants.cronNames.REFRESH_TOKEN
    });
    scheduleJob(
      constants.cronNames.REFRESH_TOKEN,
      "*/5  *  *  *  *",
      "http://localhost:3000/googleSheets/refreshAccessTokens",
      {},
      "post"
    );
    return ;
  } catch(error){
    console.log("error_while_refreshing_cron",error);
    return ;
  }
 
};




async function scheduleSheetRefresh(opts){
  try {   
    logg.log("OPTS_IN_SHEET_REFRESH",opts);
    const schedulerData = opts.scheduler_data ;
    const cronString =  `*/${schedulerData.interval_in_minutes} * * */${schedulerData.month.join(',*/')} */${schedulerData.days.join(',*/')}` ;
    logg.log("CRONE_STRING=>",cronString);

    scheduleJob(
      constants.cronNames.RESYNC_SHEET + `${opts.userId}-${opts.scheduler_data.sheet_id}` ,
      cronString , 
      constants.cronApis.resynctSheet ,
      {
        email  : opts.email
      },
      constants.requestMethods.post
    );
  } catch(error){
    console.log("error_while_schedule_refresh=>",error);
    return ;
  }
}

module.exports = {
  scheduleJob,
  scheduleCronViaAgenda,
  scheduleRefreshTokenCron ,
  scheduleSheetRefresh
};
