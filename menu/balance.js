var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, lang = require("../conf.d/language.json")
, model = require("../models/customer")
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, intelect = require("../controllers/account")
, intelectBalance = require("../controllers/balance")
, accountlogic = require("../controllers/account")
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http
exports.saving= async function(mobile,msg){
	var menu= await jsonCache.get(mobile)
	let local =menu.local
	if(msg === '*'){
			if(menu.accounts.length ===1){
				menu.state = 'service'
				menu.message = lang[local].service
			}else {
				var message =lang[local].continue 
				let accountList =[]
				for (let index = 0; index < menu.accounts.length; index++) {
					let AccountId = menu.accounts[index];
					var number = index+1;
					message += `${number}.  ${AccountId}\n`
				}
				log.info(accountList);
				message += lang[local].back
				menu.state ='accountListForSaving';
				menu.message = message
			}
	}else if(msg === '9'){
				menu.state = 'service'
				menu.message = lang[local].service
	}else {
		switch (menu.menu) {
			case 'saving':
				 let accountDetail =await accountlogic.accountDetails(mobile,menu.fromAccount)
				 if(accountDetail.data){
					 menu.message = ` ${lang[local].retry} ${accountDetail.data.AccountHolderName}\n`+
					 `${lang[local].balance}  ${accountDetail.data.AvailableBalance} ${lang[local].etb} \n` +lang[local].back
				 }else {
					 menu.action = 'end';
					 menu.message = lang[local].systemError
				 }
			 break;
			 case 'list':
				 log.info(accountDetail);
				 if(accountDetail.status === 'RH'){
					 menu.state ='saving';
					 menu.menu = 'saving';
					 menu.index = 1;
					 menu.message = ` \n${accountDetail.data.AccountHolderName}\n`+
					 `${lang[local].balance}  ${accountDetail.data.AvailableBalance} ${lang[local].etb} ` +lang[local].retry
				 }else {
					 menu.action = 'end';
					 menu.message = lang[local].systemError
				 }
				 break;
			 }
	}
			return menu
		} 

