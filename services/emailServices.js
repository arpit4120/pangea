

var nodemailer    = require("nodemailer");

const Promise = require("bluebird");
const Handlebars = require("handlebars");
const constants = require("./../properties/constants");
const adminServices = require("./../modules/admin/adminServices/adminServices");
const loggs = require("./../services/logging");

const notificationMessagesJson = require("./../messages/notificationMessages");

