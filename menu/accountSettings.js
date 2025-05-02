var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, lang = require("../conf.d/language.json")
, model = require("../models/customer")
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, accountlogic = require("../controllers/account")
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http
exports.Settings= async function(mobile,msg){
	var menu= await jsonCache.get(mobile)
	let local =menu.local
	if (msg=== '*') {
		menu.state = 'service';
		menu.message =lang[local].service
	}else {
		switch (menu.menu) {
			case 'list':
					if (msg=== '*') {
						menu.message =lang[local].service 
						menu.state ='service';
					}else if(msg === '1'){
						menu.message =lang[local].currentPin +lang[local].back 
						menu.menu = 'current'
						menu.state ='changePin';
					}else if(msg === '2'){
						menu.message =lang[local].linkAccount +lang[local].back 
						menu.menu = 'link'
					}else if(msg === '3' && menu.index){
						menu.message =lang[local].removeAccount +lang[local].back 
						menu.menu = 'delink'
					}else if(msg === '3' && !menu.index){
						menu.message =lang[local].removeAccount +lang[local].back 
						menu.menu = 'delink'
					}else {
								menu.menu='list'
								menu.message = lang[local].retry +lang[local].accountSettings
					}
					break;
					case 'link':
							let accountDetail =await accountlogic.accountDetails(mobile,msg)
							let linkedAcount =await accountlogic.linkAccount(mobile,msg)
							if(linkedAcount.data){
								if(accountDetail.data){
									if(msg.length === 13 && accountDetail.data.AccountHolderName && !menu.accounts.includes(msg) && linkedAcount){
										let addCustomerAccount = await model.linkAccount(mobile,accountDetail.data.AccountHolderName,linkedAcount.data.customerNo,msg)
										log.info(addCustomerAccount);
										if(addCustomerAccount.status ===0){
											menu.menu ='end'
											menu.message =lang[local].linkOk  
										}else {
											menu.menu ='end'
											menu.message =lang[local].systemError  
										}
									}else if( menu.accounts.includes(msg)){
										menu.menu ='link'
										menu.message =lang[local].alreadylink +lang[local].linkAccount +lang[local].back 
									}else {
										menu.menu ='link'
										menu.message =lang[local].retry +lang[local].linkAccount +lang[local].back 
									}
								}else {
									menu.menu ='link'
									menu.message =lang[local].retry +lang[local].linkAccount +lang[local].back 
								}
							}else {
									menu.menu ='link'
									menu.message =lang[local].retry +lang[local].linkAccount +lang[local].back 
							}
						break;
						case 'delink':
							if(msg.length === 13){
								let deLinkedAcount =await accountlogic.linkAccount(mobile,msg)
								log.info(deLinkedAcount);
								if(deLinkedAcount.data){
									let removeCustomerAccount = await model.deLinkAccount(mobile,deLinkedAcount.data.customerNo,msg)
									log.info(removeCustomerAccount);
										if(removeCustomerAccount.status ===0){
											menu.menu ='end'
											menu.message =lang[local].deLinkOk  
										}else {
											menu.menu ='end'
											menu.message =lang[local].systemError  
										}
								}else {
									log.info(removeCustomerAccount);
										menu.menu ='link'
										menu.message =lang[local].retry +lang[local].removeAccount +lang[local].back 
								}	
							}else {
								menu.menu ='link'
								menu.message =lang[local].invalidAccount +lang[local].removeAccount +lang[local].back 
							}
							
						break;
		}
		}

	return menu
} 


