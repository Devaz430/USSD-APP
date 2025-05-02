
'use strict'

const configs = require("./conf.d")
, server = require("./ussd")
, model = require("./models/customer")
,  servicemenu = require("./menu/service")
,  serverConfig = configs.getServerConfig()
,  intel = configs.apiConfig()
,  url = require('url')
,  querystring = require('querystring')
,  Logger = require("bunyan")
,  ussd = server.init(serverConfig)
,  appServer =ussd.app
,  jsonCache =ussd.jsonCache
,  log =ussd.log
,  http =ussd.http


  appServer.use((req, res, next)=> {
  	next();
  })
  
  appServer.get('/', async (req, res) => {
      res.send("USSD APP working")
  })
  appServer.post('/deletemobile', async (req, res) => {

    let timestamp =  req.body.timestamp,
    phoneNumber  = req.body.phoneNumber,
    userName =  req.body.userName,
    password =  req.body.password,
    response;
   let sms= null;
   let languageCode = null;
   let mobile = null
  log.debug(req.body)
  if(timestamp && phoneNumber && userName && password && Object.keys(req.body).length === 4) {
  if(userName === 'systemadmin' && password === 'sddDDerQSNCK34SOWEK5354fdgdf4'){
          let customerRecord = await model.deleteCustomerMobile(phoneNumber)
		      response= {
               "responseCode": "0",
              "message": "Success, Record deleted Sucessfully!!"
      }

  }else {
      response= {
      "responseCode": "1",
      "message": "Access Denied, Incorrect Credentials"
      }
      log.info('Response  :',`Access Denied, Incorrect Credentials for phoneNumber : ${phoneNumber}  message content  ${message}`);
  }
}else {
      response= {
               "responseCode": "1",
              "message": "System Error, Incorrect message content"
      }
}
  res.send(response)
})
 
appServer.get('/deletemobile', async (req, res) => {

    let timestamp =  req.body.timestamp,
    phoneNumber  = req.body.phoneNumber,
    userName =  req.body.userName,
    password =  req.body.password,
    response;
   let sms= null;
   let languageCode = null;
   let mobile = null
  log.debug(req.body)
  if(timestamp && phoneNumber && userName && password && Object.keys(req.body).length === 4) {
  if(userName === 'systemadmin' && password === 'sddDDerQSNCK34SOWEK5354fdgdf4'){
          let customerRecord = await model.deleteCustomerMobile(phoneNumber)
  }else {
      response= {
      "responseCode": "1",
      "message": "Access Denied, Incorrect Credentials"
      }
      log.info('Response  :',`Access Denied, Incorrect Credentials for phoneNumber : ${phoneNumber}  message content  ${message}`);
  }
}else {
      response= {
               "responseCode": "1",
              "message": "System Error, Incorrect message content"
      }
}
})
appServer.listen(7070, () => {
    log.info('Server running at:', serverConfig.port);
});
