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

exports.balanceInquery= async function(mobile,accountNUmber){
	var data ={
		"AccountId" : accountNUmber
	}
	try {
					var accountBalance = await axios.post(intel.accDetail,data)
					.then(function (response) {
						log.info(`Get account by Phone for customer ${mobile} response with errorCode  : ${response.data.errorCode}`  );
						// if(Number(response.data.errorCode) === 0){
							if(response.data.Response){
								let customerName =response.data.Response.AccountHolderName 
							    let balance =response.data.Response.AvailableBalance
								return {'errorCode': response.data.errorCode,'AccountId': response.data.Response.AccountId ,'customerName' : customerName, 'balance' : balance,"Currency" : response.data.Response.Currency}
							}else return {'errorCode': response.data.errorCode ,'AccountId': null,'customerName' : null, 'balance' : null,"Currency" : null}
						// }else {
						// 	log.info(`Get account by Phone for customer ${mobile} response with errorCode  : ${response.data.errorCode}`  );
						// 	return {'errorCode': response.data.errorCode,'customerName' : null , 'balance' : null}
						// }
					}).catch(function (error) {
						log.info(error);
						return {'errorCode': null, 'AccountId': null,'customerName' : null, 'balance' : null,"Currency" : null}
					});
		return accountBalance
	}catch (error) {
		return {'errorCode': null ,'AccountId': null,'customerName' : null, 'balance' : null,"Currency" : null}
	}
} 





 




 



