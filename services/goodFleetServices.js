const logg = require("./logging");
const Promise = require("bluebird");

const constant = require("./../properties/constants");
const mysqlConnection = require("./../databases/mysql/mysql");
const universalFunction = require("./universanFucntions");

const requestPromise = require("request-promise");
const responses=require("./responses");

function showDriversFromGoodFleets(opts) {
  try {
    opts.apiKey = opts.apiKey;
    const options = {
      method: "GET",
      url: `${config.get("goodFleetBaseUrl")}/api/open/getDrivers?apiKey=${
        opts.apiKey
      }&teamId=${opts.teamId}`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      json: true,
    };

    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}

function addDriversToGoodFleetsTeam(opts) {
  try {
    opts.apiKey = opts.apiKey;
    const options = {
      method: "POST",
      url: `${config.get("goodFleetBaseUrl")}/api/open/addDriver`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      body: opts,
      json: true,
    };
    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}
function updateDriversToGoodFleetsTeam(opts) {
  try {
    opts.apiKey = opts.apiKey;
    const options = {
      method: "PUT",
      url: `${config.get("goodFleetBaseUrl")}/api/open/updateDriver`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      body: opts,
      json: true,
    };
    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}

function getTeamFromGoodFleets(opts) {
  try {
    //   opts.apiKey= config.get("goodFleetApiKey")
    const options = {
      method: "GET",
      url: `${config.get("goodFleetBaseUrl")}/api/open/getTeam?apiKey=${
        opts.apiKey
      }`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      body: opts,
      json: true,
    };
    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}

function addTeamInGoodFleet(opts) {
  try {
    opts.apiKey = opts.apiKey;
    const options = {
      method: "POST",
      url: `${config.get("goodFleetBaseUrl")}/api/open/registerTeam`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      body: opts,
      json: true,
    };
    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}

function updateTeamInGoodFleet(opts) {
  try {
    opts.apiKey = opts.apiKey;
    const options = {
      method: "POST",
      url: `${config.get("goodFleetBaseUrl")}/api/open/updateTeam`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      body: opts,
      json: true,
    };
    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}

function performTeamOperations(opts) {
  Promise.coroutine(function* () {
    if (!opts.teamId) {
      opts.teamName
        ? (opts.teamName = `${
            opts.teamName
          }_${universalFunction.generateRandomString(4)}`)
        : "";
      const teamResponse = yield addTeamInGoodFleet({
        teamName: opts.teamName,
        baseFare: opts.baseFare || 0,
        timeFare: opts.timeFare || 0,
        distanceFare: opts.distanceFare || 0,
        apiKey: opts.apiKey,
      });

      logg.log("TEAM_RESPONSE=>", teamResponse);
      let teamId;
      if (
        teamResponse.statusCode == constant.responseCodes.SUCCESS &&
        teamResponse.data
      ) {
        logg.log("TEAM_RESPONSE_CHECK=>", teamResponse);

        if (typeof teamId === "string") {
          try {
            teamResponse = JSON.parse(teamResponse);
          } catch (error) {
            logg.log("ERROR_WHILE_PARSING_TEAM_RESP=>", error);
          }
        }

        teamId = teamResponse.data.teamId;
      }

      if (opts.branchId && teamId) {
        let sql = ` UPDATE tb_branches SET teamId = ? WHERE branchId = ?  `;
        yield mysqlConnection.runMysqlQueryPromisified(
          "UPDATING_TEAM_IN_BRANCH",
          sql,
          [teamId, opts.branchId]
        );
      }
    } else {
      yield updateTeamInGoodFleet({
        teamName: opts.teamName,
        baseFare: opts.baseFare || 0,
        timeFare: opts.timeFare || 0,
        distanceFare: opts.distanceFare || 0,
        teamId: opts.teamId,
        apiKey: opts.apiKey,
      });
    }
  })()
    .then(() => {})
    .catch((error) => {
      logg.log("ERROR_WHILE_ADD_AND_MAP_TEAM=>", error);
    });
}
function editJobsInGoodFleet(opts) {
  try {
    opts.apiKey = opts.apiKey;
    const options = {
      method: "POST",
      url: `${config.get("goodFleetBaseUrl")}/api/open/editJobs`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      body: opts,
      json: true,
    };
    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}

function getTeamDetails(opts) {
  try {
    opts.apiKey = opts.apiKey;
    const options = {
      method: "GET",
      url: `${config.get("goodFleetBaseUrl")}/api/open/getTeam?apiKey=${
        opts.apiKey
      }&teamId=${opts.teamId}`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      // qs : opts,
      json: true,
    };
    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}

function rateDriver(opts) {
  try {
    opts.apiKey = opts.apiKey;
    const options = {
      method: "POST",
      url: `${config.get("goodFleetBaseUrl")}/api/open/rateDriver`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      body: opts,
      json: true,
    };
    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}

function getDriverDetails(opts) {
  try {
    opts.apiKey = opts.apiKey;
    const options = {
      method: "GET",
      url: `${config.get(
        "goodFleetBaseUrl"
      )}/api/open/getDriverDetails?apiKey=${opts.apiKey}&overAllJobId=${
        opts.overAllJobId
      }`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      // qs : opts,
      json: true,
    };
    logg.log("SESSION_REQUEST==>", options);
    return requestPromise(options);
  } catch (error) {
    console.log("ERROR_WHILE_CREATE_ORDER_IN_FLEET==>", error);
    throw error;
  }
}



async function getDriverReport(res,opts){
  try{
    logg.log("report of driver=>", opts);
    const options = {
      method: "get",
      url: `${config.get("goodFleetBaseUrl")}/api/open/getDriverReport?apiKey=${opts.apiKey}&driverId=${opts.driverId}&type=${opts.type}&startDate=${opts.startDate}&endDate=${opts.endDate}`,
      headers: {
        "Content-Type": "application/json",
        "content-language": "en",
      },
      json: true,
    };
    let response=await requestPromise(options);
    console.log("response=>",response.data);
    return responses.sendCustomSuccessResponse(res,"en",response.data);
  }
  catch(err)
  {
    console.log("error while assigning the driver==>",error);
    throw error;
  }
}
module.exports = {
  getDriverReport,
  rateDriver,
  getTeamDetails,
  getTeamFromGoodFleets,
  updateDriversToGoodFleetsTeam,
  addDriversToGoodFleetsTeam,
  showDriversFromGoodFleets,
  updateTeamInGoodFleet,
  addTeamInGoodFleet,
  performTeamOperations,
  editJobsInGoodFleet,
  getDriverDetails,
};
