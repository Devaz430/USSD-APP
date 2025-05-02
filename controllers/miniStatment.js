var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, axios = require('axios')
, ussd = server.init(serverConfig)
, appServer =ussd.app
, log =ussd.log
, http =ussd.http

exports.miniStatmentInquery= async function(mobile,accountNumber){
log.info(`account  number is `+accountNumber);
	var miniData =  {
		"NoOfTxns": "5",
		"AccountId": accountNumber,
		"RequestId": "IBAAAAE3F814",
		"StatementType": "NoOfTxn",
		"RequestTime": "20220804102223",
	}
	
	try {
					var miniStatement = await axios.post(intel.miniStatement,miniData)
					.then(function (response) {
						log.info(response.data.Response.Records);
						log.info(`Get account by Phone for customer ${mobile} response with errorCode  : ${response.data.errorCode}`  );
						if(response.data.Response.Records){
							log.info(response.data);
							if(response.data.Response){
								let tnxRecord =response.data.Response.Records
								return {'errorCode': 0,'Records': tnxRecord }
							}else return {'errorCode': 1,'Records': '' }
						}else {
							log.info('this means else fo error code');
							log.info(`Get account by Phone for customer ${mobile} response with errorCode  : ${response.data.errorCode}`  );
							return {'errorCode': 2,'Records' : null }
						}
					}).catch(function (error) {
						// log.info(error);
						log.info('this mean error for catch');

						return {'errorCode': null,'Records': null }
					});
		return miniStatement
	}catch (error) {
		// log.info(error);
		return {'errorCode': null,'Records': null}
	}
} 



 



