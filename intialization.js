const env = "sumer";
const http = require("http");
const mysqlDb = require("./databases/mysql/mysql");
const mongo = require("./databases/mongo/mongo");
const logg = require("./services/logging");

//const agendaService = require("./services/agendaServices");

async function initializeSerevrComponents() {
  try {
    
    connection = await mysqlDb.initializeMysqlConnection(
      config.get('dataBaseSettings.mysql')
    );  

    // db = await mongo.initializeMongoConnection( config.get('dataBaseSettings.mongo'));
    // agenda = await mongo.intializeAgenda(config.get('dataBaseSettings.mongo'));
    // agendaService.scheduleRefreshTokenCron();
    await startHttpServer(config.get('port'));
    console.log("IN_APP.JS")
logg.log("PROCESS_ENV==>",{
  ENV_FILE : process.env
});
  } catch (error) {
    console.log("error while_intializing_server", error);
  }
};
function startHttpServer(port) {
  return new Promise((resolve, reject) => {
    var server = http.createServer(app);
    io = require('socket.io')(server);
    server.listen(port, function() {
      console.error(
        "###################### Express connected ##################",
        port
      );
      return resolve(server);
    });
  });
}

// os = server().then(server=>{
//   io = socketio(server);
//   // console.log(io)
// })
// console.log(io)
module.exports = {
  initializeSerevrComponents
};
