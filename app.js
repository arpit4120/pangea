/* VIJAY */
// process.env.NEW_RELIC_ENABLED = true ;
// process.env.NEW_RELIC_APP_NAME = ['my trolley'];
// process.env.NEW_RELIC_LICENSE_KEY = 'dcbfa5e2659dd6be98c48da0911bdd66317aNRAL' ;
// process.env.NEW_RELIC_NO_CONFIG_FILE = true;

// var appRoot = require('app-root-path');
// var myModule = require(appRoot + '/lib/my-module.js');

console.log("APPLICATION_ROOT=>", __dirname);

//require('newrelic');

const bodyParser = require("body-parser");
const express = require("express");
config = require("config");
app = express();
const env = "dev";
const cors = require("cors");
const EventEmitter = require("events");

class MyEmitter extends EventEmitter {}

myEmitter = new MyEmitter();
require("./services/socket");

const socketio = require("socket.io");

//blockchain
const pinataSDK = require("@pinata/sdk");
const multer = require("multer");
const fs = require("fs");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const path = require("path");


const intialization = require("./intialization");
const logg = require("./services/logging");
const adminRoutes = require("./modules/admin/index");
const customerRoutes = require("./modules/customer/index");
// const whiteLabelRoutes = require("./modules/whitelabel/index");
 const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// if (process.env.NODE_ENV === "dev") {
//   swaggerDocument.host = "api.moskenes.io";
// } else {
//   swaggerDocument.host = "localhost:3000";
// }

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/", (req, res, next) => {
  logg.log("API_CALLED=>", {
    PATH: req.path,
    BODY: req.body,
    QUERY: req.query,
  });
  next();
});

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.post("/email_testing", (req, res) => {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(config.get("emailCreds.SENDGRID_API_KEY"));
  const msg = {
    to: "anjalikamboj03@gmail.com",
    from: "vy725343@moskenes.io",
    subject: "Mails are working in sendgrid",
    text: "Congrats ! Mails are working in sendgrid",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };
  sgMail.send(msg, (error, result) => {
    console.log("error_and_REsult===>", error, result);
  });
  res.send({});
});

app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
// app.use('/api/whiteLabel',whiteLabelRoutes)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.sendFile("client/index.html", { root: __dirname });
});
//app.use('/api/v1', router);
// app.use('/api/branch//shedule')

//bloackchain
const imageStorage = multer.diskStorage({
  // Destination to store image
  destination: "images",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + path.extname(file.originalname));
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});

const pinata = pinataSDK(
  "4a43ef92dedd8fd50862",
  "f0aa468ee0dfe865bca5e7d9b47690bb10d2c69f9ccce0e4d3845344b72452c4"
);

pinata
  .testAuthentication()
  .then((result) => {
    //handle successful authentication here
    console.log(result);
  })
  .catch((err) => {
    //handle error here
    console.log(err);
  });

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

app.post("/pinata_upload", imageUpload.single("image"), async (req, res) => {
  var data = req.body;
  console.log("Request Headers", req.headers);
  const file = req.file;
  console.log("server side: ", file);
  try {
    const P = file.path;
    var readableStreamForFile = fs.createReadStream(P);
    console.log(typeof readableStreamForFile);
    var options = {
      pinataMetadata: {
        name: `${data.name}.img`,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };
    try {
      var result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    } catch (e) {
      console.log(e, "error");
    }
    console.log(result);
    data.image = "https://gateway.pinata.cloud/ipfs/" + result.IpfsHash;
    console.log(data);
    options = {
      pinataMetadata: {
        name: `${data.name}.json`,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    try {
      result = await pinata.pinJSONToIPFS(data, options);
    } catch (e) {
      console.log(e, "error");
    }
    console.log(result);
    res.send(result.IpfsHash);
  } catch (err) {
    console.log(err);
    return res.send(err);
  }

  // res.send("success");
});


intialization.initializeSerevrComponents();
// os.then(mana=>{
//   console.log(mana)
// })
