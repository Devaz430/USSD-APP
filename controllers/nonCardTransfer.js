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

exports.nonCardEnquiry= async function(mobile,fromAccount,toAccount,fromBank,toBank,channel){
	id = (new Date()).getTime().toString(36).toUpperCase() + Math.random().toString(36).toUpperCase().slice(9)
	var nonCardTransferData = {
		    "sourceAccount": {
			    "instId": fromBank,
		        "accountNumber":fromAccount
		    },
		    "destAccount": {
		        "instId":toBank,
		        "accountNumber":toAccount,
		        "currency": 230
		    },
		    "refnum":id,
		    "localTransactionDateTime": new Date().toJSON().slice(0,19),
			// "channelId" :channel
		
		}
		log.info(nonCardTransferData)
	try {
					var transferResponse =await http.post(intel.nonCardEnquiry,nonCardTransferData)
					.then(function (response) {
						log.info(`Get account by Phone for customer ${mobile} response with errorCode  : ${response.data.errorCode}`  );
							log.info(response.data)
							if(response.data.errorCode === '0'){
								let tnxRecord =response.data
								return {'errorCode': response.data.errorCode,'data': tnxRecord }
							}else {
								return {'errorCode': 1,'data': null }
							}
					}).catch(function (error) {
						return {'errorCode': null,'data': null }
					});
		return transferResponse
	}catch (error) {
		return  {'errorCode': null,'data': null }
	}
} 
exports.nonCardTransfer= async function(mobile,fromAccount,toAccount,amount,fromBank,toBank){
	id = (new Date()).getTime().toString(36).toUpperCase() + Math.random().toString(36).toUpperCase().slice(9)
	var nonCardTransferData ={
    					"sourceAccount": {
        				"instId": fromBank,
        				"accountNumber": fromAccount
    				},
    					"destAccount": {
        				"instId": toBank,
        				"accountNumber": toAccount
    				},
    					"amount": {
        				"amount": amount,
        				"currency": 230
    				},
    					"refnum": id,
    					"localTransactionDateTime": new Date().toJSON().slice(0,19),
    					"channelId": "USSD"
				}
		log.info(nonCardTransferData);
		try {
			var transferResponse =await http.post(intel.nonCardTransfer,nonCardTransferData)
			.then(function (response) {
					if(response.data.status === '1' && response.data.errorCode === '0'){
						let tnxRecord =response.data
						return {'errorCode': response.data.status,'data': tnxRecord }
					}else {
						return {'errorCode': 0,'data': response.data}
					}
			}).catch(function (error) {
				log.info(error);
				return {'errorCode': null,'data': null }
			});
		return transferResponse
		}catch (error) {
		return  {'errorCode': null,'data': null }
		}
} 



 



