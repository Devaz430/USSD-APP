var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http



exports.balanceaccount= async function(mobile,msg){
	var menu= await jsonCache.get(mobile)

	menu.accounts = response.data.accountDetails
	  if(msg=== '*' ) {
		menu.state = 'service';
		menu.prestate = 'accountListForSaving'
		var message =`Select a service to procced:  \n1. Balance Inquiry \n2. Fund Transfer \n3. Payment  \n4. Mini Statement \n5. Change PIN`;
	  }else if(msg > 0 && msg <= menu.accounts.length) {
			menu.state ='saving';
			menu.prestate = 'accountListForSaving'
			var number = msg-1;
			menu.fromAccount = menu.accounts[number].accountNumber
			var data ={
				"AccountId" : menu.fromAccount
			}
			const response   = await http.post(intel.accDetail,data)
												.then(function (response) {
													return response;
												})
												.catch(function (error) {
												return null;
												});
									menu.customerName =response.data.Response.AccountHolderName 
									menu.balance =response.data.Response.AvailableBalance
									var message = `${menu.customerName}\n`+
			`Your avaiable balance is  ${menu.balance} ${lang[local].etb}` +lang[local].back
		
		
	  }
	
	return message;
} 



