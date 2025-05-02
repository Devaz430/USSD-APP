var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, lang = require("../conf.d/language.json")
, accountlogic = require("../controllers/account")
, institution = configs.institution()
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http


exports.transfer= async function(mobile,msg){
	var menu= await jsonCache.get(mobile)
	let local =menu.local
	if(msg === '*'){
		menu.state = 'service'
		menu.prestate = 'service'
		menu.message =lang[local].service;

	}else if(msg === '9'){
		menu.state = 'service'
		menu.prestate = 'service'
		menu.message =lang[local].service;

	}
	if(menu.permissions.length === 0){
		menu.action ='end'
		menu.message =lang[local].notAllowed  
	}else if(menu.permissions.length ===1){
		menu.prestate = 'transfer'
		if(msg === '1'){
			menu.state = 'ahadu'
			menu.menu = 'source'
			menu.fromAccount= menu.permissions[0]
			let accountDetail =await accountlogic.accountDetails(mobile,menu.fromAccount)
			if(accountDetail.data){
				menu.balance =accountDetail.data.AvailableBalance
				menu.message =lang[local].withInBank + lang[local].destinationAccount  
			}else {
				menu.message =lang[local].systemError  
			}
		}else if(msg=== '2'){
			menu.fromAccount= menu.permissions[0]
			menu.fromBank = institution.ahadu
			let balance =await accountlogic.accountDetails(mobile,menu.fromAccount)
		    if(balance.data){
			    menu.balance =balance.data.AvailableBalance
		    }else {
			    menu.action = 'end'
				menu.message =lang[local].systemError 
		    }
			menu.state = 'otherBank'
			menu.menu ='bank1'
			menu.page = 1
			let message =lang[local].destinationBank;
				message += `1. ${lang[local].cbe}`
				message += `2. ${lang[local].awash}`
				message += `3. ${lang[local].dashen}`
				message += `4. ${lang[local].boa}`
				message += `5. ${lang[local].wegagen}`
				message += `${lang[local].more} \n`;
				message += lang[local].back;
				menu.message = message
		}else if(msg === '3'){
                        menu.fromAccount= menu.permissions[0]
                        menu.state = 'telebirr'
                        menu.menu ='amount'
                                        let balance =await accountlogic.accountDetails(mobile,menu.fromAccount)
                                        if(balance.data){
                                                menu.balance =balance.data.AvailableBalance
                                                menu.message =lang[local].destinationAccount;
                                        }else {
                                                menu.action = 'end'
                                                menu.message =lang[local].systemError
                                        }
					//telebirr 
					 telebirrEnquiry = await accountlogic.teleBirrEnquiry(mobile,"Test")
if(telebirrEnquiry.status === '0' && (telebirrEnquiry.data.IdentityStatus ==='00' || telebirrEnquiry.data.IdentityStatus === '02' || telebirrEnquiry.data.IdentityStatus === '03')){	
						menu.isReset =telebirrEnquiry.data.KYCField[27].KYCValue+' ' + telebirrEnquiry.data.KYCField[28].KYCValue + ' ' + telebirrEnquiry.data.KYCField[29].KYCValue
			 		 menu.message =lang[local].ownTeleBirr +`${lang[local].from} ${menu.fromAccount}\n ${lang[local].to} ${ menu.isReset}(${mobile})\n`+ lang[local].amount + lang[local].back  ;
					}else {
				                 menu.message ='';
					       if(telebirrEnquiry.data.IdentityStatus === '04'){
						  menu.message = lang[local].accountSuspend;
					        }else if(telebirrEnquiry.data.IdentityStatus === '05'){
                                                  menu.message = lang[local].accountFrozen;
                                                }else if(telebirrEnquiry.data.IdentityStatus === '06'){
                                                  menu.message = lang[local].accountClosed;
                                                }else if(telebirrEnquiry.data.IdentityStatus === '07'){
                                                  menu.message = lang[local].accountCapped;
                                                }else if(telebirrEnquiry.data.IdentityStatus === '08'){
                                                  menu.message = lang[local].accountDormant;
                                                }
						menu.action ='end'
					}
					//telebirr 
                }else {
			menu.message =lang[local].retry + lang[local].twoTransferService+ lang[local].back
		}

	}else if(menu.permissions.length >1){
		menu.prestate = 'transfer'
		if(msg  === '1'){
			menu.state = 'own'
			menu.menu ='list'
			menu.step ='list'
			let message = lang[local].sourceAccount
			for (let index = 0; index < menu.permissions.length; index++) {
				let AccountId = menu.permissions[index];
				var number = index+1;
				message += `${number}. ${AccountId}  \n`
			}
			message +=lang[local].back
			menu.message = message
		}else if(msg === '2'){
			menu.state = 'ahadu'
			menu.menu ='list'
			let message = lang[local].continue
			for (let index = 0; index < menu.permissions.length; index++) {
				let AccountId = menu.permissions[index];
				var number = index+1;
				message += `${number}. ${AccountId}  \n`
			}
			message +=lang[local].back
			menu.message = message
		}else if(msg=== '3'){
			menu.state = 'otherBank'
			menu.fromBank = institution.ahadu
			menu.menu ='list'
			let message =lang[local].sourceAccount
			for (let index = 0; index < menu.permissions.length; index++) {
				let AccountId = menu.permissions[index];
				var number = index+1;
				message += `${number}. ${AccountId}  \n`
			}
			message +=lang[local].back
			menu.message = message
		}else if(msg=== '4'){
                        menu.state = 'telebirr'
                        menu.menu ='list'
                        let message =lang[local].sourceAccount
                        for (let index = 0; index < menu.permissions.length; index++) {
                                let AccountId = menu.permissions[index];
                                var number = index+1;
                                message += `${number}. ${AccountId}  \n`
                        }
                        message +=lang[local].back
                        menu.message = message
                }else {
			menu.message =lang[local].retry + lang[local].threeTransferService+ lang[local].back
		}
	}
	
	return menu;
} 
