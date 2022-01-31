

var nodemailer    = require("nodemailer");

const Promise = require("bluebird");
const Handlebars = require("handlebars");
const constants = require("./../properties/constants");
const adminServices = require("./../modules/admin/adminServices/adminServices");
const loggs = require("./../services/logging");

const notificationMessagesJson = require("./../messages/notificationMessages");

function sendMandrillEmail(opts){
  return new Promise((resolve,reject)=>{

    Promise.coroutine(function*(){
//       let mandrillDetails = yield adminServices.getMandrillDetails(opts) 
//       if(!mandrillDetails || !mandrillDetails.length){
//         throw(constants.commonResponseMessages.EMAIL_SERVICE_IS_NOT_ACTIVATED);
//       };

//       mandrillDetails = mandrillDetails[0];

      var mailOptions = {
        from:  'My trolley <support@my-trolley.com> ' ,   // mandrillDetails.from , // sender address
        to: opts.receiverEmail, // list of receivers
        subject:   "Order invoice", // Subject line
        html: opts.html, // html body,
        text :  "Your order is completed"
      };
     
      
     
         smtpTransport = nodemailer.createTransport({
          host: 'smtp.mandrillapp.com'  , // mandrillDetails.host ,
          port: '587' , //mandrillDetails.port
          auth: {
            user: '' ,   // mandrillDetails.user,
            pass: ''  // mandrillDetails.apiPassword
          }
        });

        loggs.log("MAIL_OPTIONS=>",mailOptions);

        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            loggs.logError("MAIL_OPTIONS_ERROR=>",error);
            return reject(error);
          } else {
            loggs.logError("MAIL_OPTIONS=>",response);
              return resolve({});
          }
        });

    })().then(()=>{

    }).catch((error)=>{
      console.log("ERROR_WHILE_SENDING_MANDRILL_EMAIL=>",error);
      
    })
  })
}



 




    function sendOrderInvoice(opts){
      return new Promise((resolve,reject)=>{
        Promise.coroutine(function*(){
          loggs.log("IN_SEND_ORDER_INVOICE=>",opts);
            let  productsArray  = ` ` ;
            
            for(let i = 0 ; i < opts.products.length ; i++){ 
            productsArray +=  Handlebars.compile(constants.productElement)({
                  productName :  opts.products[i].name ,
                  quantity :opts.products[i].quantityBooked , 
                  skuId :opts.products[i].skuId ,
                  price :opts.products[i].actualPrice ,
                  currency :opts.products[i].currency
                });
            };


          loggs.log("PRODUCTS_ARRAY=>",productsArray);

         let invoiceHtml =   Handlebars.compile(constants.invoiceHtml)({
          companyName :    opts.companyName,
          orderDate :    opts.orderDate , 
          orderNumber : opts.orderNumber ,
          paymentMethod : opts.paymentMethod ,
          slot : opts.slot , 
          orderTotal :  opts.totalPaidAmount ,
          currency : 'Lbp' ,
          deliveryCharges : opts.deliveryCharges   ,
          customerName : opts.customerName ,
          customerPhoneNo : opts.customerPhoneNo ,
          address  :opts.address ,
          description : opts.description

        });

        invoiceHtml= invoiceHtml.replace('{productsArray}',productsArray)

        loggs.log("INVOICE_HTML=>",invoiceHtml);

        opts.html = invoiceHtml ;

        yield sendMandrillEmail(opts);

        return  resolve();

        })().then(()=>{
          
        }).catch((error)=>{
          console.log("ERROR_WHILE_SEND_INVOICE==>",error);
          return reject(error);
        })
      });
    }



    module.exports = {
      sendMandrillEmail ,
      sendOrderInvoice
    }